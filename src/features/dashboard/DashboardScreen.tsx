import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useStore } from '../../core/store/useStore';
import { theme } from '../../core/design/theme';
import { Wallet, Users, FileText, MessageCircle, PlusCircle, CheckCircle } from 'lucide-react-native';
import { generateLedgerPDF } from '../../core/utils/pdfService';

const MetricCard = ({ title, value, color }: { title: string, value: string, color: string }) => (
  <View style={[styles.card, { borderTopWidth: 4, borderTopColor: color }]}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
  </View>
);

const MemberItem = React.memo(({ member, onMarkPaid }: any) => {
  // Memoized Item for high performance
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberFlat}>Flat {member.flat_number} • {member.phone}</Text>
      </View>
      {member.is_paid ? (
        <View style={styles.paidBadge}>
          <CheckCircle size={16} color={theme.colors.success} />
          <Text style={styles.paidText}>Paid</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => onMarkPaid(member.id)}
        >
          <Text style={styles.payButtonText}>Mark Paid</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export const DashboardScreen = () => {
  const { activeSociety, members, metrics, initialize, createDefaultSociety, addMemberOptimistic, markPaidOptimistic } = useStore();

  useEffect(() => {
    initialize();
    // Simulate initial setup if empty
    setTimeout(() => {
      if (!useStore.getState().activeSociety) {
        createDefaultSociety('Gokuldham Society', 1500);
        addMemberOptimistic('Jethalal Gada', 'A-01', '+919999999991');
        addMemberOptimistic('Bhinde Master', 'A-02', '+919999999992');
        addMemberOptimistic('Taarak Mehta', 'A-03', '+919999999993');
      }
    }, 500);
  }, []);

  const handleMarkPaid = useCallback((id: number) => {
    // 1500 is default mocked payload amount here
    markPaidOptimistic(id, activeSociety?.default_amount || 0, 'UPI');
  }, [activeSociety, markPaidOptimistic]);

  if (!activeSociety) {
    return (
      <View style={styles.center}>
        <Text style={theme.typography.subheader}>Loading Society Khata...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeSociety.name}</Text>
          <Text style={styles.subtitle}>{members.length} Members Registered</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Users color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* METRICS SCROLL */}
      <View style={styles.metricsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
          <MetricCard title="Total Collected" value={`₹${metrics.totalCollected.toLocaleString()}`} color={theme.colors.success} />
          <MetricCard title="Pending Dues" value={`₹${metrics.totalPending.toLocaleString()}`} color={theme.colors.warning} />
          <MetricCard title="Completion" value={`${metrics.paidPercentage.toFixed(1)}%`} color={theme.colors.primary} />
        </ScrollView>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn}>
          <PlusCircle color={theme.colors.textPrimary} size={24} />
          <Text style={styles.actionText}>Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Wallet color={theme.colors.textPrimary} size={24} />
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => generateLedgerPDF(activeSociety, members, metrics)}
        >
          <FileText color={theme.colors.textPrimary} size={24} />
          <Text style={styles.actionText}>PDF Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle color={theme.colors.textPrimary} size={24} />
          <Text style={styles.actionText}>WhatsApp Sync</Text>
        </TouchableOpacity>
      </View>

      {/* LEDGER LIST */}
      <View style={styles.ledgerContainer}>
        <Text style={styles.ledgerTitle}>Member Ledger</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MemberItem member={item} onMarkPaid={handleMarkPaid} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
        />
      </View>
    </SafeAreaView>
  );
};

// Styles implementing the design semantics
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  profileBtn: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.bgPrimary,
    borderRadius: theme.radius.round,
  },
  metricsContainer: {
    marginTop: theme.spacing.m,
  },
  metricsScroll: {
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.bgSecondary,
    padding: theme.spacing.l,
    borderRadius: theme.radius.m,
    width: 160,
    ...theme.shadows.card,
  },
  cardTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  cardValue: {
    ...theme.typography.numbers,
    marginTop: theme.spacing.s,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.m,
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    backgroundColor: theme.colors.bgSecondary,
    padding: theme.spacing.m,
    borderRadius: theme.radius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    flexDirection: 'row',
    gap: theme.spacing.s,
    ...theme.shadows.card,
  },
  actionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  ledgerContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgSecondary,
    borderTopLeftRadius: theme.radius.l,
    borderTopRightRadius: theme.radius.l,
    padding: theme.spacing.m,
    ...theme.shadows.float,
  },
  ledgerTitle: {
    ...theme.typography.subheader,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.m,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...theme.typography.subheader,
    color: theme.colors.textPrimary,
  },
  memberFlat: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.radius.round,
  },
  payButtonText: {
    color: theme.colors.bgSecondary,
    fontWeight: '700',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.radius.round,
  },
  paidText: {
    color: theme.colors.success,
    fontWeight: '700',
  }
});
