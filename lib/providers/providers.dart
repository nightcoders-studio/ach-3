import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mart2you/models/cart_item.dart';
import 'package:mart2you/models/product.dart';

/// Provider for the list of products available in the market.
final productsProvider = Provider<List<Product>>((ref) {
  return const [
    Product(
      id: '1',
      name: 'Beras Premium',
      price: 65000,
      stock: 120,
      emoji: '🍚',
      category: 'Bahan Pokok',
    ),
    Product(
      id: '2',
      name: 'Minyak Goreng',
      price: 28000,
      stock: 85,
      emoji: '🫗',
      category: 'Bahan Pokok',
    ),
    Product(
      id: '3',
      name: 'Gula Pasir',
      price: 14000,
      stock: 200,
      emoji: '🍬',
      category: 'Bahan Pokok',
    ),
    Product(
      id: '4',
      name: 'Telur Ayam',
      price: 28000,
      stock: 50,
      emoji: '🥚',
      category: 'Protein',
    ),
    Product(
      id: '5',
      name: 'Susu UHT',
      price: 18000,
      stock: 75,
      emoji: '🥛',
      category: 'Minuman',
    ),
    Product(
      id: '6',
      name: 'Roti Tawar',
      price: 15000,
      stock: 40,
      emoji: '🍞',
      category: 'Roti & Kue',
    ),
    Product(
      id: '7',
      name: 'Indomie Goreng',
      price: 3500,
      stock: 300,
      emoji: '🍜',
      category: 'Mie Instan',
    ),
    Product(
      id: '8',
      name: 'Kopi Sachet',
      price: 2000,
      stock: 500,
      emoji: '☕',
      category: 'Minuman',
    ),
    Product(
      id: '9',
      name: 'Sabun Mandi',
      price: 8500,
      stock: 90,
      emoji: '🧼',
      category: 'Perawatan',
    ),
    Product(
      id: '10',
      name: 'Sambal Botol',
      price: 12000,
      stock: 65,
      emoji: '🌶️',
      category: 'Bumbu',
    ),
    Product(
      id: '11',
      name: 'Air Mineral',
      price: 4000,
      stock: 150,
      emoji: '💧',
      category: 'Minuman',
    ),
    Product(
      id: '12',
      name: 'Teh Celup',
      price: 9000,
      stock: 110,
      emoji: '🍵',
      category: 'Minuman',
    ),
  ];
});

/// Notifier for managing the shopping cart state using modern Riverpod API.
class CartNotifier extends Notifier<List<CartItem>> {
  @override
  List<CartItem> build() => [];

  /// Add a product to the cart or increment its quantity.
  void addToCart(Product product) {
    final existingIndex = state.indexWhere(
      (item) => item.productId == product.id,
    );

    if (existingIndex >= 0) {
      final existing = state[existingIndex];
      state = [
        ...state.sublist(0, existingIndex),
        existing.copyWith(quantity: existing.quantity + 1),
        ...state.sublist(existingIndex + 1),
      ];
    } else {
      state = [
        ...state,
        CartItem(
          productId: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji,
        ),
      ];
    }
  }

  /// Remove one quantity from a cart item or remove entirely if quantity is 1.
  void removeFromCart(String productId) {
    final existingIndex = state.indexWhere(
      (item) => item.productId == productId,
    );

    if (existingIndex < 0) return;

    final existing = state[existingIndex];
    if (existing.quantity > 1) {
      state = [
        ...state.sublist(0, existingIndex),
        existing.copyWith(quantity: existing.quantity - 1),
        ...state.sublist(existingIndex + 1),
      ];
    } else {
      state = [
        ...state.sublist(0, existingIndex),
        ...state.sublist(existingIndex + 1),
      ];
    }
  }

  /// Clear all items from the cart.
  void clearCart() {
    state = [];
  }
}

/// Provider for the shopping cart state.
final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(
  CartNotifier.new,
);

/// Provider for the total number of items in the cart.
final cartItemCountProvider = Provider<int>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (total, item) => total + item.quantity);
});

/// Provider for the total cart price.
final cartTotalProvider = Provider<double>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (total, item) => total + item.totalPrice);
});
