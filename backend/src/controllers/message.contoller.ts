import { Request, Response } from "express";
import User from "../models/user.model";
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";
import { getReceiverSocketId, io } from "../lib/socket";

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSidebar", error);
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user?._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: myId },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages", error);
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text, image, voice } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    let voiceUrl;
    if (voice) {
      const uploadResponse = await cloudinary.uploader.upload(voice, {
        folder: "voiceMessages",
        resource_type: "video",
      });
      voiceUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      voice: voiceUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const deleteConversation = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id: otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Adding current user to deletedFor for all messages
    await Message.updateMany(
      {
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      {
        $addToSet: { deletedFor: userId },
      }
    );

    // Fetch updated messages to check deletion status
    const updatedConversationMessages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });

    const userIdStr = userId.toString();
    const otherUserIdStr = otherUserId.toString();

    // Checking if messages are deleted by both users
    const allDeletedByBoth = updatedConversationMessages.every((msg) => {
      const deletedForArray = msg.deletedFor.map((id) => id.toString());
      return (
        deletedForArray.includes(userIdStr) &&
        deletedForArray.includes(otherUserIdStr)
      );
    });

    if (allDeletedByBoth) {
      //  Delete all messages from database
      await Message.deleteMany({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      });

      // Notify both users
      const otherUserSocketId = getReceiverSocketId(otherUserId);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("conversationHardDeleted", { userId });
      }

      res.status(200).json({
        message: "Conversation permanently deleted",
        deleted: true,
      });
    } else {
      // Soft delete
      const otherUserSocketId = getReceiverSocketId(otherUserId);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("conversationDeleted", { userId });
      }

      res.status(200).json({
        message: "Conversation deleted for you",
        deleted: false,
      });
    }
  } catch (error) {
    console.log("Error in deleteConversation", error);
    res.status(500).json({ error: "Internal server Error" });
  }
};
