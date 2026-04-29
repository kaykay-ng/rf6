import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const eventStyles = StyleSheet.create({
  // ── Containers ────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerWithPadding: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  scrollContentLarge: {
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  body: {
    flex: 1,
  },

  // ── Typography ─────────────────────────────────────────────────────────
  title: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 32,
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  subtitleLarge: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: Colors.text,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  labelSmall: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
  hint: {
    fontFamily: 'Oswald_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  charCount: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  emptyText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },

  // ── Inputs & Fields ────────────────────────────────────────────────────
  field: {
    marginBottom: 28,
  },
  fieldCentered: {
    alignItems: 'center',
    marginBottom: 40,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 1,
    fontFamily: 'Oswald_400Regular',
  },
  inputLarge: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 40,
    color: Colors.text,
    fontFamily: 'Oswald_400Regular',
    backgroundColor: Colors.white,
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#B01020',
  },
  inputWarning: {
    borderColor: Colors.accent,
  },
  pinInput: {
    width: 200,
    height: 80,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    fontSize: 40,
    fontFamily: 'Oswald_400Regular',
    letterSpacing: 12,
    textAlign: 'center',
    color: Colors.text,
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#B01020',
    letterSpacing: 0.3,
    marginTop: 6,
  },

  // ── Buttons ────────────────────────────────────────────────────────────
  cta: {
    marginHorizontal: 28,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 1.5,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    letterSpacing: 1.5,
    color: Colors.white,
  },

  // ── Camp Selection ─────────────────────────────────────────────────────
  campList: {
    gap: 10,
  },
  campButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  campButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  campButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  campButtonName: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  campButtonNameSelected: {
    color: Colors.white,
  },
  campButtonAddress: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  campButtonAddressSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 20,
    color: Colors.white,
  },

  // ── Date/Time Selection ────────────────────────────────────────────────
  dayScroll: {
    gap: 8,
    paddingRight: 28,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  dayPillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayPillText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  dayPillTextSelected: {
    color: Colors.white,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 8,
  },

  // ── Location Selection ─────────────────────────────────────────────────
  locationPills: {
    flexDirection: 'row',
    gap: 10,
  },
  locationPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  locationPillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  locationPillText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  locationPillTextSelected: {
    color: Colors.white,
  },
  locationNameContainer: {
    marginTop: 12,
  },

  // ── Summary ────────────────────────────────────────────────────────────
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 28,
  },
  summaryTitle: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 14,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryField: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 6,
    lineHeight: 18,
  },
  summaryLabel: {
    fontFamily: 'Oswald_700Bold',
  },
  captionLabel: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Oswald_400Regular',
    letterSpacing: 0.3,
  },

  // ── Loading & States ───────────────────────────────────────────────────
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 36,
    color: Colors.white,
    letterSpacing: 1,
  },

  // ── Stepper ────────────────────────────────────────────────────────────
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.white,
    height: 50,
  },
  stepperButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
  },
  stepperButtonLast: {
    borderRightWidth: 0,
  },
  stepperButtonText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Oswald_400Regular',
    color: Colors.text,
  },
  stepperValueEmpty: {
    color: Colors.textSecondary,
  },
});
