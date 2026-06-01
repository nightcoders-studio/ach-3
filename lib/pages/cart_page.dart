import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mart2you/constant/constant_color.dart';
import 'package:mart2you/models/product.dart';
import 'package:mart2you/providers/providers.dart';

/// The shopping cart page displaying items added by the user.
class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartItems = ref.watch(cartProvider);
    final cartTotal = ref.watch(cartTotalProvider);

    return Scaffold(
      backgroundColor: AppColors.offWhiteRice,
      appBar: AppBar(
        backgroundColor: AppColors.deepSpinach,
        foregroundColor: AppColors.offWhiteRice,
        title: const Text(
          'Keranjang Belanja',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
        ),
        actions: [
          if (cartItems.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_rounded),
              tooltip: 'Kosongkan keranjang',
              onPressed: () {
                _showClearCartDialog(context, ref);
              },
            ),
        ],
      ),
      body: cartItems.isEmpty
          ? _buildEmptyCart()
          : _buildCartList(cartItems, ref),
      bottomNavigationBar: cartItems.isNotEmpty
          ? _buildCheckoutBar(context, cartTotal, cartItems.length)
          : null,
    );
  }

  /// Builds the empty cart state view.
  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('🛒', style: TextStyle(fontSize: 64)),
          const SizedBox(height: 16),
          Text(
            'Keranjang masih kosong',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.deepSpinach,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Yuk mulai belanja!',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.deepSpinach.withValues(alpha: 0.5),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds the scrollable list of cart items.
  Widget _buildCartList(List cartItems, WidgetRef ref) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: cartItems.length,
      itemBuilder: (context, index) {
        final item = cartItems[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppColors.deepSpinach.withValues(alpha: 0.06),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              // Emoji
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.deepSpinach.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(item.emoji, style: const TextStyle(fontSize: 28)),
                ),
              ),
              const SizedBox(width: 14),

              // Name & Price
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.deepSpinach,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Rp ${_formatPrice(item.totalPrice)}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.deepSpinach.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),

              // Quantity Controls
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.deepSpinach.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildQtyButton(
                      icon: Icons.remove_rounded,
                      onTap: () => ref
                          .read(cartProvider.notifier)
                          .removeFromCart(item.productId),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Text(
                        '${item.quantity}',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.deepSpinach,
                        ),
                      ),
                    ),
                    _buildQtyButton(
                      icon: Icons.add_rounded,
                      onTap: () {
                        // We need the product to addToCart — reconstruct it
                        ref.read(cartProvider.notifier).addToCart(
                              _productFromCartItem(item),
                            );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  /// Builds the sticky checkout bar at the bottom.
  Widget _buildCheckoutBar(
      BuildContext context, double total, int itemCount) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: AppColors.deepSpinach.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Total Info
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total ($itemCount item)',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.deepSpinach.withValues(alpha: 0.5),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Rp ${_formatPrice(total)}',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppColors.deepSpinach,
                    ),
                  ),
                ],
              ),
            ),

            // Checkout Button
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Checkout berhasil! 🎉'),
                    backgroundColor: AppColors.deepSpinach,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.deepSpinach,
                foregroundColor: AppColors.offWhiteRice,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 2,
              ),
              child: const Text(
                'Checkout',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds a small icon button for quantity control.
  Widget _buildQtyButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: SizedBox(
          width: 34,
          height: 34,
          child: Icon(icon, size: 18, color: AppColors.deepSpinach),
        ),
      ),
    );
  }

  /// Shows a confirmation dialog for clearing the cart.
  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Kosongkan Keranjang?'),
        content: const Text(
          'Semua item di keranjang akan dihapus.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clearCart();
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade400,
              foregroundColor: Colors.white,
            ),
            child: const Text('Hapus Semua'),
          ),
        ],
      ),
    );
  }

  /// Reconstructs a Product from a CartItem for the addToCart method.
  Product _productFromCartItem(dynamic item) {
    return Product(
      id: item.productId,
      name: item.name,
      price: item.price,
      emoji: item.emoji,
      stock: 0,
      category: '',
    );
  }

  /// Formats a price with dot separator (e.g., 65000 → "65.000").
  String _formatPrice(double price) {
    final priceStr = price.toInt().toString();
    final buffer = StringBuffer();
    for (var i = 0; i < priceStr.length; i++) {
      if (i > 0 && (priceStr.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(priceStr[i]);
    }
    return buffer.toString();
  }
}
