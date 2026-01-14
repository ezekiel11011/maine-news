import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';
import { colors, typography, spacing, fontSize } from '../../constants/theme';
import { Camera, Send, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

export default function TipsScreen() {
  const [headline, setHeadline] = useState('');
  const [details, setDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!headline || !details) {
      Alert.alert('Missing Information', 'Please provide a headline and some details for your tip.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tips`, {
        headline,
        details,
        isAnonymous
      });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.data.error || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Tip submission error:', error);
      Alert.alert(
        'Submission Failed',
        'Could not connect to the secure tip server. Please check your connection or try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 size={80} color={colors.accent} />
        <Text style={styles.successTitle}>Tip Received</Text>
        <Text style={styles.successText}>
          Thank you for your intelligence. Our editors will review this shortly. Estimated review time: 4-6 hours.
        </Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setSubmitted(false);
            setHeadline('');
            setDetails('');
          }}
        >
          <Text style={styles.resetButtonText}>Send Another Tip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Send a News Tip</Text>
          <Text style={styles.subtitle}>
            Have a story? Spotted something? Submit it here. Secure and encrypted.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>HEADLINE</Text>
          <TextInput
            style={styles.input}
            placeholder="What's happening?"
            placeholderTextColor={colors.textDim}
            value={headline}
            onChangeText={setHeadline}
            selectionColor={colors.accent}
          />

          <Text style={styles.label}>DETAILS</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide context, locations, names, or any other details..."
            placeholderTextColor={colors.textDim}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={6}
            selectionColor={colors.accent}
          />

          <TouchableOpacity
            style={styles.anonToggle}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
              {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.anonInfo}>
              <Text style={styles.anonLabel}>Remain Anonymous</Text>
              <Text style={styles.anonSublabel}>Your identity will be masked even from editors.</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.uploadButton}>
              <Camera color={colors.text} size={24} />
              <Text style={styles.uploadText}>Attach Photos/Video</Text>
            </TouchableOpacity>
            <Text style={styles.limitText}>Max 3 files (100MB limit)</Text>
          </View>

          <View style={styles.securitySeal}>
            <ShieldCheck size={16} color={colors.accent} />
            <Text style={styles.sealText}>256-BIT ENCRYPTION SECURED</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Text style={styles.submitText}>Submit Intelligence</Text>
                <Send size={20} color={colors.background} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 1,
    marginBottom: -8,
  },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.md,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accent,
  },
  checkmark: {
    color: colors.background,
    fontWeight: 'bold',
  },
  anonInfo: {
    flex: 1,
  },
  anonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  anonSublabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textDim,
  },
  uploadSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 4,
    justifyContent: 'center',
  },
  uploadText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 14,
    color: colors.text,
    textTransform: 'uppercase',
  },
  limitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.textDim,
    textAlign: 'center',
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    opacity: 0.6,
  },
  sealText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.text,
    padding: spacing.lg,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 18,
    color: colors.background,
    textTransform: 'uppercase',
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  successTitle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 32,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  successText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  resetButton: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  resetButtonText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 14,
    color: colors.accent,
    textTransform: 'uppercase',
  }
});
