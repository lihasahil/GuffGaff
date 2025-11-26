import chatSvg from "../../../assets/chat.svg";

function NoChatSelected() {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center flex flex-col items-center justify-center space-y-6">
        <img
          src={chatSvg}
          alt=""
          className="sm:ml-45 ml-15 mb-6 transition duration-700 hover:scale-105"
        />
        {/* Icon Display
        <div className="flex text-center items-center justify-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div> */}

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to GuffGaff!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
}

export default NoChatSelected;
