import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mart2you/constant/constant_color.dart';
import 'package:mart2you/models/product.dart';
import 'package:mart2you/providers/providers.dart';
import 'package:mart2you/pages/cart_page.dart';

/// The main home page displaying market stock and a cart button.
class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _fabController;
  String _selectedCategory = 'Semua';

  @override
  void initState() {
    super.initState();
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fabController.forward();
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsProvider);
    final cartItemCount = ref.watch(cartItemCountProvider);

    // Extract unique categories
    final categories = [
      'Semua',
      ...{...products.map((p) => p.category)},
    ];

    // Filter products by selected category
    final filteredProducts = _selectedCategory == 'Semua'
        ? products
        : products.where((p) => p.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppColors.offWhiteRice,
      body: CustomScrollView(
        slivers: [
          // App Bar
          _buildAppBar(context, cartItemCount),

          // Greeting Section
          SliverToBoxAdapter(child: _buildGreetingSection()),

          // Category Chips
          SliverToBoxAdapter(
            child: _buildCategoryChips(categories),
          ),

          // Stock Header
          SliverToBoxAdapter(child: _buildStockHeader(filteredProducts.length)),

          // Product Grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.72,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) =>
                    _buildProductCard(filteredProducts[index]),
                childCount: filteredProducts.length,
              ),
            ),
          ),

          // Bottom Padding
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),

      // Cart FAB
      floatingActionButton: ScaleTransition(
        scale: _fabController,
        child: FloatingActionButton.extended(
          heroTag: 'cart_fab',
          onPressed: () => _navigateToCart(context),
          backgroundColor: AppColors.deepSpinach,
          foregroundColor: AppColors.offWhiteRice,
          elevation: 6,
          icon: const Icon(Icons.shopping_cart_rounded),
          label: Text(
            cartItemCount > 0 ? 'Keranjang ($cartItemCount)' : 'Keranjang',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }

  /// Builds the custom SliverAppBar with search and cart badge.
  Widget _buildAppBar(BuildContext context, int cartItemCount) {
    return SliverAppBar(
      expandedHeight: 100,
      floating: true,
      snap: true,
      backgroundColor: AppColors.deepSpinach,
      foregroundColor: AppColors.offWhiteRice,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 20, bottom: 14),
        title: Row(
          children: [
            const Text(
              '🛒 ',
              style: TextStyle(fontSize: 18),
            ),
            const Text(
              'Mart2You',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 20,
                letterSpacing: -0.5,
              ),
            ),
            const Spacer(),
            // Cart icon with badge
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: GestureDetector(
                onTap: () => _navigateToCart(context),
                child: Badge(
                  isLabelVisible: cartItemCount > 0,
                  label: Text(
                    '$cartItemCount',
                    style: const TextStyle(fontSize: 10),
                  ),
                  backgroundColor: Colors.orangeAccent,
                  child: const Icon(
                    Icons.shopping_bag_rounded,
                    size: 24,
                    color: AppColors.offWhiteRice,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the greeting section below the app bar.
  Widget _buildGreetingSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Selamat Datang! 👋',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: AppColors.deepSpinach,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Cek stok barang kebutuhanmu hari ini',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.deepSpinach.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds the horizontal scrollable category chips.
  Widget _buildCategoryChips(List<String> categories) {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category == _selectedCategory;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(category),
              selected: isSelected,
              onSelected: (_) {
                setState(() => _selectedCategory = category);
              },
              selectedColor: AppColors.deepSpinach,
              backgroundColor: AppColors.offWhiteRice,
              labelStyle: TextStyle(
                color: isSelected ? AppColors.offWhiteRice : AppColors.deepSpinach,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                fontSize: 13,
              ),
              side: BorderSide(
                color: AppColors.deepSpinach.withValues(alpha: 0.3),
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          );
        },
      ),
    );
  }

  /// Builds the "Stok Barang" header with the item count.
  Widget _buildStockHeader(int itemCount) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
      child: Row(
        children: [
          Text(
            'Stok Barang',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.deepSpinach,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.deepSpinach.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$itemCount item',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.deepSpinach,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds a product card widget for the grid.
  Widget _buildProductCard(Product product) {
    final cart = ref.watch(cartProvider);
    final cartItem = cart.where((item) => item.productId == product.id);
    final quantityInCart =
        cartItem.isNotEmpty ? cartItem.first.quantity : 0;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.deepSpinach.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Emoji & Stock Badge
          Container(
            height: 100,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.deepSpinach.withValues(alpha: 0.05),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Text(
                    product.emoji,
                    style: const TextStyle(fontSize: 48),
                  ),
                ),
                // Stock badge
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: product.stock > 50
                          ? Colors.green.shade50
                          : Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Stok: ${product.stock}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: product.stock > 50
                            ? Colors.green.shade700
                            : Colors.orange.shade700,
                      ),
                    ),
                  ),
                ),
                // Category label
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.deepSpinach.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      product.category,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                        color: AppColors.deepSpinach,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Product Info
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            child: Text(
              product.name,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.deepSpinach,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),

          // Price
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              'Rp ${_formatPrice(product.price)}',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: AppColors.deepSpinach.withValues(alpha: 0.85),
              ),
            ),
          ),

          const Spacer(),

          // Add to Cart Button
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
            child: quantityInCart > 0
                ? _buildQuantityControl(product, quantityInCart)
                : _buildAddButton(product),
          ),
        ],
      ),
    );
  }

  /// Builds the "Tambah" button for adding a product to the cart.
  Widget _buildAddButton(Product product) {
    return SizedBox(
      width: double.infinity,
      height: 36,
      child: ElevatedButton(
        onPressed: () {
          ref.read(cartProvider.notifier).addToCart(product);
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.deepSpinach,
          foregroundColor: AppColors.offWhiteRice,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          elevation: 0,
          padding: EdgeInsets.zero,
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_rounded, size: 18),
            SizedBox(width: 4),
            Text(
              'Tambah',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the quantity increment/decrement control when item is in cart.
  Widget _buildQuantityControl(Product product, int quantity) {
    return Container(
      height: 36,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.deepSpinach.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Decrement
          _buildQtyButton(
            icon: Icons.remove_rounded,
            onTap: () {
              ref.read(cartProvider.notifier).removeFromCart(product.id);
            },
          ),
          // Quantity
          Text(
            '$quantity',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.deepSpinach,
            ),
          ),
          // Increment
          _buildQtyButton(
            icon: Icons.add_rounded,
            onTap: () {
              ref.read(cartProvider.notifier).addToCart(product);
            },
          ),
        ],
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
          width: 40,
          height: 36,
          child: Icon(icon, size: 18, color: AppColors.deepSpinach),
        ),
      ),
    );
  }

  /// Navigates to the cart page.
  void _navigateToCart(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const CartPage()),
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
