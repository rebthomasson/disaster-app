import { theme } from "./theme";
//Creates unified styling for the entire app (cards, titles, body, modals)
export const globalStyles = {
  modalCard: {
    backgroundColor: theme.colors.text,
    padding: theme.spacing.l,
    borderRadius: theme.radius.l,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  modalBody: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.radius.m,
    alignItems: 'center',
    marginVertical: theme.spacing.s,
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radius.m,
    alignItems: 'center',
    marginVertical: theme.spacing.s,
  },
  outlineButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
  },
};
