/// Represents a product available in the market.
class Product {
  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.stock,
    required this.emoji,
    required this.category,
  });

  final String id;
  final String name;
  final double price;
  final int stock;
  final String emoji;
  final String category;
}
