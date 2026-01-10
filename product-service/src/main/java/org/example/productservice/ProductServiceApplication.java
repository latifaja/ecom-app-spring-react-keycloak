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
						.name("Laptop Dell XPS 15")
						.description("High-performance laptop with Intel i7 processor, 16GB RAM, 512GB SSD")
						.price(1299.99)
						.quantity(15)
						.build();

				ProductRequestDTO product2 = ProductRequestDTO.builder()
						.name("Wireless Mouse Logitech MX Master 3")
						.description("Ergonomic wireless mouse with precision tracking and long battery life")
						.price(99.99)
						.quantity(50)
						.build();

				ProductRequestDTO product3 = ProductRequestDTO.builder()
						.name("Mechanical Keyboard Keychron K8")
						.description("Wireless mechanical keyboard with RGB backlight, Gateron switches")
						.price(89.99)
						.quantity(30)
						.build();

				ProductRequestDTO product4 = ProductRequestDTO.builder()
						.name("Monitor LG UltraWide 34\"")
						.description("34-inch curved ultrawide monitor with 3440x1440 resolution, IPS panel")
						.price(449.99)
						.quantity(20)
						.build();

				ProductRequestDTO product5 = ProductRequestDTO.builder()
						.name("Webcam Logitech C920")
						.description("Full HD 1080p webcam with autofocus and stereo audio")
						.price(79.99)
						.quantity(40)
						.build();

				productService.createProduct(product1);
				productService.createProduct(product2);
				productService.createProduct(product3);
				productService.createProduct(product4);
				productService.createProduct(product5);

				System.out.println("Dummy data inserted successfully!");
			} else {
				System.out.println("Database already contains data. Skipping dummy data insertion.");
			}
		};
	}
}

