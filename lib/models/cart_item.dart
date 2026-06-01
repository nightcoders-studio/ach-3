/// Represents an item in the shopping cart.
class CartItem {
  const CartItem({
    required this.productId,
    required this.name,
    required this.price,
    required this.emoji,
    this.quantity = 1,
  });

  final String productId;
  final String name;
  final double price;
  final String emoji;
  final int quantity;

  /// Creates a copy of this [CartItem] with the given fields replaced.
  CartItem copyWith({int? quantity}) {
    return CartItem(
      productId: productId,
      name: name,
      price: price,
      emoji: emoji,
      quantity: quantity ?? this.quantity,
    );
  }

  /// Total price for this cart item (price × quantity).
  double get totalPrice => price * quantity;
}
