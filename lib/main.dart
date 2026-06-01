import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mart2you/constant/constant_color.dart';
import 'package:mart2you/pages/home_page.dart';

void main() {
  runApp(const ProviderScope(child: Mart2YouApp()));
}

/// Root widget for the Mart2You application.
class Mart2YouApp extends StatelessWidget {
  const Mart2YouApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mart2You',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.deepSpinach,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: AppColors.offWhiteRice,
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const HomePage(),
    );
  }
}
