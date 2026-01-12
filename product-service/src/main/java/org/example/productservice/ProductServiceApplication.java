package org.example.productservice;

import org.example.productservice.dto.ProductRequestDTO;
import org.example.productservice.repository.ProductRepository;
import org.example.productservice.service.ProductService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProductServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductServiceApplication.class, args);
	}
	@Bean
	CommandLineRunner initDatabase(ProductService productService, ProductRepository productRepository) {
		return args -> {
			if (productRepository.count() == 0) {
				// Insert dummy data
				ProductRequestDTO product1 = ProductRequestDTO.builder()
						.name("phone")
						.description("sumsung galaxy ")
						.price(1500.0)
						.quantity(19)
						.build();

				ProductRequestDTO product2 = ProductRequestDTO.builder()
						.name("hard disque")
						.description("aaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaa")
						.price(1500.0)
						.quantity(19)
						.build();

				ProductRequestDTO product3 = ProductRequestDTO.builder()
						.name("azeeeeeeeeeeeeeeee")
						.description("azer azer azer azer azer azer azer azer azer azer  ")
						.price(1500.0)
						.quantity(19)
						.build();

				ProductRequestDTO product4 = ProductRequestDTO.builder()
						.name("calculator")
						.description("qqqqqqqqqqqqqqqq qqqqqqqqqqqqqqqqqqq qqqqqqqqqqqq")
						.price(1500.0)
						.quantity(19)
						.build();



				productService.createProduct(product1);
				productService.createProduct(product2);
				productService.createProduct(product3);
				productService.createProduct(product4);

				System.out.println("Dummy data inserted successfully!");
			} else {
				System.out.println("Database already contains data. Skipping dummy data insertion.");
			}
		};
	}
}

