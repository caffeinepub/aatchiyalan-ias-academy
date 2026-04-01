import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  password: string;
  itemType: string;
  itemId: bigint;
  amount: number;
  itemName: string;
  onPaymentSubmitted: () => void;
}

export default function PaymentModal({
  open,
  onClose,
  username,
  password,
  itemType,
  itemId,
  amount,
  itemName,
  onPaymentSubmitted,
}: PaymentModalProps) {
  const { actor: actorMaybe } = useActor();
  const actor = actorMaybe!;
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!upiRef.trim()) {
      toast.error("Enter UPI transaction reference");
      return;
    }
    setLoading(true);
    try {
      await actor.createPaymentRequest(
        username,
        password,
        itemType,
        itemId,
        BigInt(amount),
        upiRef,
      );
      setSubmitted(true);
      toast.success(
        "Payment request submitted! Admin will verify and approve.",
      );
      onPaymentSubmitted();
    } catch {
      toast.error("Failed to submit payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUpiRef("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay to Access Content</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-green-600 font-semibold mb-2">
              ✓ Payment request submitted
            </div>
            <p className="text-sm text-muted-foreground">
              Admin will verify your UPI payment and approve access. Please
              wait.
            </p>
            <Button onClick={handleClose} className="mt-4 w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <div className="font-semibold text-blue-900 mb-1">{itemName}</div>
              <div className="text-blue-700">
                Amount: <strong>Rs.{amount}</strong>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="font-semibold mb-1">Pay via UPI:</div>
              <div className="font-mono text-blue-800 font-bold">
                aatchiyalaniasacademy3.0@gmail.com
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                Send Rs.{amount} to the above UPI ID
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                UPI Transaction Reference *
              </Label>
              <Input
                placeholder="Enter transaction ID or UTR number"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-800 hover:bg-blue-900 text-white"
              >
                {loading ? "Submitting..." : "Submit Payment"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
