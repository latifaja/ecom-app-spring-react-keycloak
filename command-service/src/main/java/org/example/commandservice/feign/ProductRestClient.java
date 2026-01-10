package org.example.commandservice.feign;

import org.example.commandservice.dto.QuantityChangeDTO;
import org.example.commandservice.entity.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "product-service")
public interface ProductRestClient {
    @GetMapping("/products/{productId}")
    Product findProductById(@PathVariable String productId);

    @GetMapping("/products")
    List<Product> findAllProducts();

    @PutMapping("/products/{productId}/quantity")
    void updateProductQuantity(@PathVariable String productId, @RequestBody QuantityChangeDTO quantityChangeDTO);
}