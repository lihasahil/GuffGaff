import { Skeleton } from "../../../../components/ui/skeleton";

const MessageSkeleton = () => {
  // Simulate alternating sender/receiver messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {skeletonMessages.map((_, idx) => {
        const isSender = idx % 2 !== 0;

        return (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {!isSender && <Skeleton className="h-10 w-10 rounded-full" />}

            <div className="flex flex-col space-y-2 max-w-xs">
              {idx < 2 && <Skeleton className="h-3 w-20 mb-1" />}
              <Skeleton
                className={`h-12 rounded-lg ${
                  idx % 3 === 0 ? "w-40" : idx % 3 === 1 ? "w-56" : "w-32"
                }`}
              />
            </div>

            {/* Avatar (only for sender side) */}
            {isSender && <Skeleton className="h-10 w-10 rounded-full" />}
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
