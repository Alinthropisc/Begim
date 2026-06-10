import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/di/injection.dart' as di;
import 'core/di/injection.dart';
import 'core/theme/begim_colors.dart';
import 'presentation/blocs/recipe_bloc.dart';
import 'app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.initDependencies();
  
  runApp(
    const ProviderScope(
      child: BegimApp(),
    ),
  );
}

class BegimApp extends StatelessWidget {
  const BegimApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => sl<RecipeBloc>()),
      ],
      child: MaterialApp.router(
        title: 'Begim',
        debugShowCheckedModeBanner: false,
        theme: _buildTheme(),
        routerConfig: appRouter,
      ),
    );
  }

  ThemeData _buildTheme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: BegimColors.bordeaux,
        primary: BegimColors.bordeaux,
        secondary: BegimColors.gold,
        surface: BegimColors.cream,
        background: BegimColors.cream,
      ),
      scaffoldBackgroundColor: BegimColors.cream,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.cormorantGaramond(
          fontSize: 32, fontWeight: FontWeight.w600, color: BegimColors.ink,
        ),
        displayMedium: GoogleFonts.cormorantGaramond(
          fontSize: 28, fontWeight: FontWeight.w600, color: BegimColors.ink,
        ),
        headlineMedium: GoogleFonts.cormorantGaramond(
          fontSize: 22, fontWeight: FontWeight.w600, color: BegimColors.ink,
        ),
        headlineSmall: GoogleFonts.cormorantGaramond(
          fontSize: 20, fontWeight: FontWeight.w600, color: BegimColors.ink,
        ),
        titleLarge: GoogleFonts.cormorantGaramond(
          fontSize: 18, fontWeight: FontWeight.w600, color: BegimColors.ink,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: BegimColors.cream,
        foregroundColor: BegimColors.ink,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.cormorantGaramond(
          fontSize: 22, fontWeight: FontWeight.w600, color: BegimColors.ink,
        ),
      ),
    );
  }
}
