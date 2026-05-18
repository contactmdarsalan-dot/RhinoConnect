import 'package:flutter/material.dart';

class RhinoColors {
  static const rhinoBlue = Color(0xFF183F78);
  static const connectSilver = Color(0xFFB9BABD);
  static const lime = Color(0xFFDFFF25);
  static const pine = Color(0xFF062B22);
  static const alpine = Color(0xFF0B2B31);
  static const cloud = Color(0xFFF8F5EA);
  static const brandCloud = Color(0xFFF7FAF4);
  static const card = Color(0xFFFFFEF7);
  static const mist = Color(0xFFE6E0D3);
  static const sky = Color(0xFFB9E7F5);
  static const saffron = Color(0xFFF4B740);
  static const coral = Color(0xFFE95D4F);
  static const ink = Color(0xFF071811);
  static const slate = Color(0xFF627168);
  static const muted = Color(0xFFF0ECE0);
}

class AppTheme {
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: RhinoColors.pine,
      brightness: Brightness.light,
    ).copyWith(
      primary: RhinoColors.pine,
      secondary: RhinoColors.lime,
      surface: RhinoColors.card,
      error: RhinoColors.coral,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: RhinoColors.cloud,
      fontFamily: 'Roboto',
      textTheme: const TextTheme(
        displaySmall: TextStyle(fontSize: 34, height: 1.02, fontWeight: FontWeight.w900, color: RhinoColors.ink),
        headlineMedium: TextStyle(fontSize: 28, height: 1.08, fontWeight: FontWeight.w900, color: RhinoColors.ink),
        titleLarge: TextStyle(fontSize: 21, height: 1.16, fontWeight: FontWeight.w900, color: RhinoColors.ink),
        titleMedium: TextStyle(fontSize: 16, height: 1.25, fontWeight: FontWeight.w800, color: RhinoColors.ink),
        bodyLarge: TextStyle(fontSize: 16, height: 1.5, fontWeight: FontWeight.w400, color: RhinoColors.ink),
        bodyMedium: TextStyle(fontSize: 14, height: 1.45, fontWeight: FontWeight.w400, color: RhinoColors.slate),
        labelLarge: TextStyle(fontSize: 14, height: 1.2, fontWeight: FontWeight.w700, color: RhinoColors.ink),
      ),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        backgroundColor: RhinoColors.cloud,
        foregroundColor: RhinoColors.ink,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: RhinoColors.card,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(26), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(26), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(26), borderSide: const BorderSide(color: RhinoColors.pine, width: 1.3)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(58),
          elevation: 0,
          backgroundColor: RhinoColors.pine,
          foregroundColor: RhinoColors.brandCloud,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(56),
          foregroundColor: RhinoColors.ink,
          side: const BorderSide(color: RhinoColors.mist),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: BorderSide.none,
        selectedColor: RhinoColors.sky,
        backgroundColor: RhinoColors.muted,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RhinoColors.ink),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 72,
        elevation: 0,
        backgroundColor: const Color(0xFFFBFCFA),
        indicatorColor: RhinoColors.sky,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 12,
            fontWeight: states.contains(WidgetState.selected) ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
