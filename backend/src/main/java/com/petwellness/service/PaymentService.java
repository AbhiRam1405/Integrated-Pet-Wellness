package com.petwellness.service;

import com.petwellness.model.Payment;
import com.petwellness.model.PaymentStatus;
import com.petwellness.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    public Payment createOrder(Double amount, String userId) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // Razorpay expects amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        Payment payment = Payment.builder()
                .razorpayOrderId(razorpayOrder.get("id"))
                .userId(userId)
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(attributes, apiSecret);

            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setStatus(isValid ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }

            return isValid;
        } catch (RazorpayException e) {
            return false;
        }
    }
}
