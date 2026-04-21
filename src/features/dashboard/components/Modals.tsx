import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { theme } from '../../../core/design/theme';
import { useStore } from '../../../core/store/useStore';
import { KeyboardAvoidingView, Platform } from 'react-native';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  flat_number: z.string().min(1, 'Flat Number is required'),
  phone: z.string().min(10, 'Valid phone number required')
});

type MemberFormData = z.infer<typeof memberSchema>;

export const AddMemberModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const addMemberOptimistic = useStore(state => state.addMemberOptimistic);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema)
  });

  const onSubmit = (data: MemberFormData) => {
    addMemberOptimistic(data.name, data.flat_number, data.phone);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Member Registration</Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} placeholder="E.g. Jethalal Gada" value={value} onChangeText={onChange} />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="flat_number"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Flat No.</Text>
                <TextInput style={styles.input} placeholder="E.g. A-01" value={value} onChangeText={onChange} />
                {errors.flat_number && <Text style={styles.errorText}>{errors.flat_number.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={styles.input} placeholder="E.g. +91 99999 99999" value={value} onChangeText={onChange} keyboardType="phone-pad" />
                {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
              </View>
            )}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.submitBtnText}>Save Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const paymentSchema = z.object({
  memberId: z.coerce.number().min(1, 'Select a member'),
  amount: z.coerce.number().min(1, 'Enter valid amount'),
  mode: z.enum(['UPI', 'CASH'])
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const AddPaymentModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const { members, activeSociety, markPaidOptimistic } = useStore();
  
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: activeSociety?.default_amount || 0,
      mode: 'UPI'
    }
  });

  const onSubmit = (data: PaymentFormData) => {
    markPaidOptimistic(data.memberId, data.amount, data.mode);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Record Payment</Text>
          
          <Controller
            control={control}
            name="memberId"
            render={({ field: { value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Member</Text>
                <ScrollView style={styles.memberListSelector} nestedScrollEnabled>
                  {members.map(m => (
                    <TouchableOpacity 
                      key={m.id} 
                      style={[styles.memberSelectorItem, value === m.id && styles.memberSelectorItemSelected]} 
                      onPress={() => setValue('memberId', m.id)}
                    >
                      <Text style={[styles.memberSelectorText, value === m.id && styles.memberSelectorTextSelected]}>
                        {m.name} (Flat {m.flat_number})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.memberId && <Text style={styles.errorText}>{errors.memberId.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount Paid (₹)</Text>
                <TextInput style={styles.input} value={value?.toString()} onChangeText={onChange} keyboardType="numeric" />
                {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
              </View>
            )}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.submitBtnText}>Confirm Paid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: theme.colors.bgSecondary, borderRadius: theme.radius.l, padding: theme.spacing.l, ...theme.shadows.float, maxHeight: '80%' },
  modalTitle: { ...theme.typography.header, marginBottom: theme.spacing.m, color: theme.colors.textPrimary },
  inputContainer: { marginBottom: theme.spacing.m },
  label: { ...theme.typography.body, fontWeight: '600', marginBottom: theme.spacing.s, color: theme.colors.textPrimary },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.s, padding: theme.spacing.m, fontSize: 16 },
  errorText: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.m },
  cancelBtn: { flex: 1, padding: theme.spacing.m, borderRadius: theme.radius.m, backgroundColor: theme.colors.bgPrimary, alignItems: 'center' },
  cancelBtnText: { color: theme.colors.textPrimary, fontWeight: '700' },
  submitBtn: { flex: 1, padding: theme.spacing.m, borderRadius: theme.radius.m, backgroundColor: theme.colors.primary, alignItems: 'center' },
  submitBtnText: { color: theme.colors.bgSecondary, fontWeight: '700' },
  memberListSelector: { maxHeight: 150, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.s },
  memberSelectorItem: { padding: theme.spacing.s, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  memberSelectorItemSelected: { backgroundColor: theme.colors.primary },
  memberSelectorText: { color: theme.colors.textPrimary },
  memberSelectorTextSelected: { color: theme.colors.bgSecondary, fontWeight: 'bold' }
});
