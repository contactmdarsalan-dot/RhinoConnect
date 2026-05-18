import 'package:flutter/material.dart';

class RhinoColors {
  static const pine = Color(0xFF006B5A);
  static const alpine = Color(0xFF102A2E);
  static const cloud = Color(0xFFF5F8F6);
  static const mist = Color(0xFFE8EFEB);
  static const sky = Color(0xFFB9E7F5);
  static const saffron = Color(0xFFF4B740);
  static const coral = Color(0xFFE95D4F);
  static const ink = Color(0xFF0B1B22);
  static const slate = Color(0xFF52646B);
}

class AppTheme {
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: RhinoColors.pine,
      brightness: Brightness.light,
    ).copyWith(
      primary: RhinoColors.pine,
      secondary: RhinoColors.saffron,
      surface: const Color(0xFFFBFCFA),
      error: RhinoColors.coral,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: RhinoColors.cloud,
      fontFamily: 'Roboto',
      textTheme: const TextTheme(
        displaySmall: TextStyle(fontSize: 34, height: 1.05, fontWeight: FontWeight.w800, color: RhinoColors.ink),
        headlineMedium: TextStyle(fontSize: 26, height: 1.12, fontWeight: FontWeight.w800, color: RhinoColors.ink),
        titleLarge: TextStyle(fontSize: 20, height: 1.2, fontWeight: FontWeight.w800, color: RhinoColors.ink),
        titleMedium: TextStyle(fontSize: 16, height: 1.25, fontWeight: FontWeight.w700, color: RhinoColors.ink),
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
        fillColor: const Color(0xFFFBFCFA),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: RhinoColors.mist)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: RhinoColors.mist)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: RhinoColors.pine, width: 1.4)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          elevation: 0,
          backgroundColor: RhinoColors.pine,
          foregroundColor: const Color(0xFFF7FBF8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          foregroundColor: RhinoColors.ink,
          side: const BorderSide(color: RhinoColors.mist),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: BorderSide.none,
        selectedColor: RhinoColors.sky,
        backgroundColor: const Color(0xFFEFF3F0),
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RhinoColors.ink),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 72,
        elevation: 0,
        backgroundColor: const Color(0xFFFBFCFA),
        indicatorColor: RhinoColors.sky,
        labelTextStyle: MaterialStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 12,
            fontWeight: states.contains(MaterialState.selected) ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
