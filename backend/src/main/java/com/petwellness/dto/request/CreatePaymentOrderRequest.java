package com.petwellness.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentOrderRequest {
    @NotNull
    private Double amount;
}
