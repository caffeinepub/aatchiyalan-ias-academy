import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useSubmitCounselingRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      courseInterest: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitCounselingRequest(
        data.name,
        data.email,
        data.phone,
        data.courseInterest,
      );
    },
  });
}

export function useSubmitContactMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitContactMessage(data.name, data.email, data.message);
    },
  });
}
