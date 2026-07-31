"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface RazorpayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  tripName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

export function RazorpayMockModal({
  open,
  onOpenChange,
  amount,
  tripName,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
}: RazorpayModalProps) {
  useEffect(() => {
    if (!open) return;

    let isSubscribed = true;

    async function launchOfficialRazorpay() {
      try {
        // 1. Ensure official Razorpay checkout.js SDK is loaded
        if (typeof window !== "undefined" && !(window as any).Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          document.body.appendChild(script);

          await new Promise((res) => {
            script.onload = res;
            script.onerror = res;
          });
        }

        // 2. Fetch server order from Razorpay API
        let orderId = "";
        let razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RpVtiSZ0iaspVP";

        try {
          const orderRes = await fetch("/api/payments/create-demo-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, tripName }),
          });
          if (orderRes.ok) {
            const data = await orderRes.json();
            if (data.orderId) orderId = data.orderId;
            if (data.key) razorpayKey = data.key;
          }
        } catch (e) {
          console.warn("Could not create server order:", e);
        }

        if (!isSubscribed) return;

        // 3. Instantiate Official Razorpay Checkout Popup
        const options: any = {
          key: razorpayKey,
          amount: Math.round(amount * 100), // convert to paise
          currency: "INR",
          name: "Explorify Marketplace",
          description: tripName,
          image: "https://cdn-icons-png.flaticon.com/512/201/201623.png",
          order_id: orderId || undefined,
          handler: function (response: any) {
            onOpenChange(false);
            const paymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`;
            toast.success("Razorpay Test Payment Successful!", {
              description: `Payment ID: ${paymentId}`,
            });
            onSuccess(paymentId);
          },
          prefill: {
            name: customerName || "",
            email: customerEmail || "",
            contact: customerPhone || "",
          },
          notes: {
            platform: "Explorify AI Travel Planner",
          },
          theme: {
            color: "#1d6fa5",
          },
          modal: {
            ondismiss: function () {
              onOpenChange(false);
              toast.info("Razorpay Payment Window Closed");
              if (onFailure) onFailure("User closed payment window");
            },
          },
        };

        if (typeof window !== "undefined" && (window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            onOpenChange(false);
            toast.error(`Payment Failed: ${response.error?.description || "Transaction declined"}`);
            if (onFailure) onFailure(response.error);
          });
          rzp.open();
        } else {
          toast.error("Could not load Razorpay SDK. Please check internet connection.");
          onOpenChange(false);
        }
      } catch (err: any) {
        console.error("Razorpay launcher error:", err);
        onOpenChange(false);
      }
    }

    launchOfficialRazorpay();

    return () => {
      isSubscribed = false;
    };
  }, [open]);

  return null;
}
