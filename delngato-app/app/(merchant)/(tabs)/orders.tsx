/**
 * Merchant orders queue — Founder-Demo-Grade.
 *
 * This screen displays the realtime order feed from the platform store.
 * Re-renders are driven reactively by usePlatformStore. Updates to order status
 * are triggered through MockOrderRepository to achieve total prototype realism:
 * merchant transitions are instantly reflected in the customer tracking screen.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  TextInput,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  Clock,
  MapPin,
  ClipboardList,
  ChevronLeft,
  X,
  AlertTriangle,
  CheckCircle,
  Truck,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  FileText,
} from 'lucide-react-native';

import { useContainer } from '@/infrastructure';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectOrdersByStore } from '@/domain/selectors';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { colors, fonts, shadow } from '@/shared/theme';
import { showToast } from '@/shared/ui/toast';
import type { Order, OrderItem, OrderStatus, IssueReportCategory } from '@/domain/types';

type Tab = 'new' | 'preparing' | 'ready' | 'done';

type ViewState = 'queue' | 'detail' | 'reject' | 'issue';

export default function MerchantOrders() {
  const container = useContainer();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection, pick } = useRtl();

  // Selected Tab state
  const [activeTab, setActiveTab] = useState<Tab>('new');

  // Selected Order for detail view
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Stateful sub-views within detail view
  const [viewState, setViewState] = useState<ViewState>('queue');

  // Form states
  const [rejectionReason, setRejectionReason] = useState('item-out');
  const [customRejectionText, setCustomRejectionText] = useState('');
  const [issueCategory, setIssueCategory] = useState<IssueReportCategory>('item-out');
  const [issueDescription, setIssueDescription] = useState('');

  // UI state
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Retrieve active store ID from the platform store
  const storeId = usePlatformStore((s) => {
    const storeIds = Object.keys(s.stores);
    return storeIds.length > 0 ? storeIds[0]! : 'demo-store';
  });

  // Select reference-stable raw store orders dict and run transforms locally in useMemo
  const ordersDict = usePlatformStore((s) => s.orders);
  
  // Realtime subscription mapping: updates local order state
  const [allStoreOrders, setAllStoreOrders] = useState<readonly Order[]>([]);

  useEffect(() => {
    const unsub = container.orderRepo.subscribeForStore(storeId, (updatedOrders) => {
      setAllStoreOrders(updatedOrders);
    });
    return unsub;
  }, [container.orderRepo, storeId]);

  // Compute orders belonging to current activeTab
  const filteredOrders = useMemo(() => {
    return allStoreOrders.filter((order) => {
      switch (activeTab) {
        case 'new':
          return order.status === 'new';
        case 'preparing':
          return order.status === 'accepted' || order.status === 'preparing';
        case 'ready':
          return order.status === 'ready';
        case 'done':
          return (
            order.status === 'picked' ||
            order.status === 'delivered' ||
            order.status === 'rejected' ||
            order.status === 'cancelled'
          );
        default:
          return false;
      }
    });
  }, [allStoreOrders, activeTab]);

  // Compute counts for all tabs for badges
  const counts = useMemo(() => {
    let fresh = 0;
    let prep = 0;
    let ready = 0;
    let done = 0;

    allStoreOrders.forEach((o) => {
      if (o.status === 'new') fresh++;
      else if (o.status === 'accepted' || o.status === 'preparing') prep++;
      else if (o.status === 'ready') ready++;
      else if (
        o.status === 'picked' ||
        o.status === 'delivered' ||
        o.status === 'rejected' ||
        o.status === 'cancelled'
      )
        done++;
    });

    return { new: fresh, preparing: prep, ready, done };
  }, [allStoreOrders]);

  // Grab the currently open order detail from cache safely
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return allStoreOrders.find((o) => o.id === selectedOrderId) ?? null;
  }, [allStoreOrders, selectedOrderId]);

  // Action handers with loading locks
  const handleAccept = async (orderId: string) => {
    setLoadingAction('accept');
    try {
      await container.orderRepo.accept(orderId);
      showToast('تم قبول الطلب بنجاح');
      setViewState('queue');
      setSelectedOrderId(null);
    } catch (e) {
      showToast('فشل قبول الطلب');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    setLoadingAction('prepare');
    try {
      await container.orderRepo.startPreparing(orderId);
      showToast('بدأ تحضير الطلب الآن');
    } catch (e) {
      showToast('فشل بدء تحضير الطلب');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setLoadingAction('ready');
    try {
      await container.orderRepo.markReady(orderId);
      showToast('الطلب جاهز للاستلام الآن');
    } catch (e) {
      showToast('فشل تحديث حالة الطلب');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleHandover = async (orderId: string) => {
    setLoadingAction('handover');
    try {
      // Handover to mock driver
      await container.orderRepo.handover(orderId, 'drv_mock_123');
      showToast('تم تسليم الطلب للكابتن');
      setViewState('queue');
      setSelectedOrderId(null);
    } catch (e) {
      showToast('فشل تسليم الطلب');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedOrderId) return;
    setLoadingAction('reject');
    try {
      const reason =
        rejectionReason === 'other'
          ? customRejectionText || 'أخرى'
          : rejectionLabelFor(rejectionReason);

      await container.orderRepo.reject(selectedOrderId, reason);
      showToast('تم رفض الطلب بنجاح');
      setViewState('queue');
      setSelectedOrderId(null);
      setCustomRejectionText('');
    } catch (e) {
      showToast('فشل رفض الطلب');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleIssueSubmit = async () => {
    if (!selectedOrderId) return;
    setLoadingAction('issue');
    try {
      await container.orderRepo.reportIssue(selectedOrderId, {
        category: issueCategory,
        description: issueDescription || issueLabelFor(issueCategory),
      });
      showToast('تم إرسال بلاغ المشكلة بنجاح');
      setViewState('detail');
      setIssueDescription('');
    } catch (e) {
      showToast('فشل إرسال البلاغ');
    } finally {
      setLoadingAction(null);
    }
  };

  const rejectionLabelFor = (key: string): string => {
    switch (key) {
      case 'item-out':
        return 'انتهت كمية الصنف من المحل';
      case 'store-closed':
        return 'المحل مغلق حالياً';
      case 'out-of-zone':
        return 'خارج منطقة التغطية المحددة';
      default:
        return 'أسباب أخرى';
    }
  };

  const issueLabelFor = (key: string): string => {
    switch (key) {
      case 'item-out':
        return 'عجز في بعض الأصناف المطلوبة';
      case 'wrong-address':
        return 'عنوان العميل غير دقيق أو خاطئ';
      case 'customer-unreachable':
        return 'العميل لا يرد على الهاتف';
      case 'delay':
        return 'تأخر في تحضير الطلب أو الكابتن';
      case 'damage':
        return 'تلف في مكونات الطلب أثناء التحضير';
      default:
        return 'مشكلة أخرى';
    }
  };

  // Human-readable status badges
  const renderStatusBadge = (status: OrderStatus) => {
    let bg = 'rgba(31,74,61,0.08)';
    let text: string = colors.olive;
    let label = '';

    switch (status) {
      case 'new':
        bg = 'rgba(232,177,79,0.15)';
        text = colors.statusPendingText;
        label = 'جديد';
        break;
      case 'accepted':
        bg = 'rgba(31,74,61,0.1)';
        text = colors.olive;
        label = 'مقبول';
        break;
      case 'preparing':
        bg = 'rgba(31,74,61,0.1)';
        text = colors.olive;
        label = 'بنحضّر';
        break;
      case 'ready':
        bg = 'rgba(232,177,79,0.15)';
        text = colors.statusPendingText;
        label = 'جاهز للتسليم';
        break;
      case 'picked':
      case 'delivered':
        bg = 'rgba(31,74,61,0.08)';
        text = colors.inkLight;
        label = 'منتهي';
        break;
      case 'rejected':
        bg = 'rgba(197,59,44,0.1)';
        text = colors.statusIssueText;
        label = 'مرفوض';
        break;
      case 'cancelled':
        bg = 'rgba(197,59,44,0.1)';
        text = colors.statusIssueText;
        label = 'ملغي';
        break;
      default:
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.olive }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الطلبات الواردة</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>مباشر</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Stateful View Router Controller */}
      {viewState === 'queue' ? (
        <View style={{ flex: 1 }}>
          {/* Gorgeous custom tab controls */}
          <View style={[styles.tabsRow, { flexDirection }]}>
            {(['new', 'preparing', 'ready', 'done'] as Tab[]).map((tabKey) => {
              const isActive = activeTab === tabKey;
              const count = counts[tabKey] ?? 0;
              let label = '';
              switch (tabKey) {
                case 'new':
                  label = 'جديد';
                  break;
                case 'preparing':
                  label = 'بنحضّر';
                  break;
                case 'ready':
                  label = 'جاهز/تسليم';
                  break;
                case 'done':
                  label = 'منتهي';
                  break;
              }

              return (
                <Pressable
                  key={tabKey}
                  onPress={() => setActiveTab(tabKey)}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                    { flexDirection },
                  ]}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {label}
                  </Text>
                  {count > 0 ? (
                    <View
                      style={[
                        styles.tabBadge,
                        isActive ? styles.tabBadgeActive : styles.tabBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          { color: isActive ? colors.olive : colors.inkLight },
                        ]}
                      >
                        {arDigits(count)}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Dynamic Order List */}
          <ScrollView
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => {
                const itemNames = o.items.map((it) => it.name).join(' · ');
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => {
                      setSelectedOrderId(o.id);
                      setViewState('detail');
                    }}
                    style={({ pressed }) => [
                      styles.orderCard,
                      pressed && styles.orderCardPressed,
                      { direction: isRtl ? 'rtl' : 'ltr' },
                    ]}
                  >
                    <View style={[styles.cardHeader, { flexDirection }]}>
                      <View style={{ flexDirection, alignItems: 'center', gap: 6 }}>
                        <Text style={styles.orderId}>{o.id}</Text>
                        {renderStatusBadge(o.status)}
                      </View>
                      <View style={{ flexDirection, alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color={colors.inkMute} />
                        <Text style={styles.timeText}>{arDigits(o.timerSec)} ث</Text>
                      </View>
                    </View>

                    <Text style={[styles.customerName, { textAlign: pick('right', 'left') }]}>
                      {o.customerName}
                    </Text>

                    <View style={[styles.itemsRow, { flexDirection, gap: 6 }]}>
                      <ClipboardList size={14} color={colors.inkLight} />
                      <Text style={[styles.itemsText, { textAlign: pick('right', 'left'), flex: 1 }]} numberOfLines={1}>
                        {itemNames}
                      </Text>
                    </View>

                    <View style={[styles.cardFooter, { flexDirection }]}>
                      <View style={{ flexDirection, alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} color={colors.inkMute} />
                        <Text style={styles.footerSubText}>
                          {arDigits(o.distanceKm)} كم
                        </Text>
                      </View>
                      <Text style={styles.orderTotal}>
                        {arDigits(o.total)} ج.م
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <ShoppingBag size={48} color={colors.canvas300} />
                <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
                <Text style={styles.emptySub}>
                  طلبات تبويب "{activeTab === 'new' ? 'جديد' : activeTab === 'preparing' ? 'بنحضّر' : activeTab === 'ready' ? 'جاهز/تسليم' : 'منتهي'}" هتظهر هنا أول بأول.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : selectedOrder ? (
        <View style={{ flex: 1 }}>
          {/* Sub-view router switcher */}
          {viewState === 'detail' && (
            <View style={{ flex: 1 }}>
              {/* Back to list bar */}
              <Pressable
                onPress={() => setViewState('queue')}
                style={[styles.backBar, { flexDirection }]}
              >
                <ChevronLeft
                  size={20}
                  color={colors.olive}
                  style={{ transform: [{ rotate: isRtl ? '180deg' : '0deg' }] }}
                />
                <Text style={styles.backBarText}>العودة لقائمة الطلبات</Text>
              </Pressable>

              <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
                {/* Info Card */}
                <View style={styles.detailCard}>
                  <View style={[styles.detailHeader, { flexDirection }]}>
                    <View>
                      <Text style={styles.detailId}>{selectedOrder.id}</Text>
                      <Text style={[styles.detailTime, { textAlign: pick('right', 'left') }]}>
                        تم الطلب: {arDigits(selectedOrder.placedAt.substring(11, 16))}
                      </Text>
                    </View>
                    {renderStatusBadge(selectedOrder.status)}
                  </View>

                  {/* Customer Block */}
                  <View style={[styles.sectionBlock, { borderTopWidth: 0 }]}>
                    <View style={[styles.customerInfo, { flexDirection }]}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {selectedOrder.customerName.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.detailCustomerName, { textAlign: pick('right', 'left') }]}>
                          {selectedOrder.customerName}
                        </Text>
                        <Text style={[styles.detailCustomerPhone, { textAlign: pick('right', 'left') }]}>
                          {arDigits(selectedOrder.customerPhone)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => void Linking.openURL(`tel:${selectedOrder.customerPhone}`)}
                        style={styles.callButton}
                      >
                        <Phone size={18} color={colors.olive} />
                      </Pressable>
                    </View>

                    <View style={[styles.addressRow, { flexDirection, gap: 8 }]}>
                      <MapPin size={16} color={colors.inkLight} />
                      <Text style={[styles.addressText, { textAlign: pick('right', 'left'), flex: 1 }]}>
                        {selectedOrder.address}
                      </Text>
                    </View>

                    {selectedOrder.note ? (
                      <View style={[styles.noteRow, { flexDirection, gap: 8 }]}>
                        <FileText size={16} color={colors.gold600} />
                        <Text style={[styles.noteText, { textAlign: pick('right', 'left'), flex: 1 }]}>
                          ملاحظة العميل: "{selectedOrder.note}"
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Items list */}
                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionTitle, { textAlign: pick('right', 'left') }]}>
                      أصناف الطلب
                    </Text>
                    {selectedOrder.items.map((it, idx) => (
                      <View
                        key={`${it.productId}-${idx}`}
                        style={[styles.detailItemRow, { flexDirection }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.detailItemName, { textAlign: pick('right', 'left') }]}>
                            {it.name}
                          </Text>
                          {it.sub ? (
                            <Text style={[styles.detailItemSub, { textAlign: pick('right', 'left') }]}>
                              {it.sub}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={styles.detailItemQty}>
                          {arDigits(it.qty)}×
                        </Text>
                        <Text style={styles.detailItemPrice}>
                          {arDigits(it.subtotal)} ج.م
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Price breakdown */}
                  <View style={styles.sectionBlock}>
                    <View style={[styles.priceRow, { flexDirection }]}>
                      <Text style={styles.priceLabel}>قيمة الأصناف</Text>
                      <Text style={styles.priceValue}>{arDigits(selectedOrder.subtotal)} ج.م</Text>
                    </View>
                    <View style={[styles.priceRow, { flexDirection }]}>
                      <Text style={styles.priceLabel}>رسوم التوصيل</Text>
                      <Text style={styles.priceValue}>{arDigits(selectedOrder.deliveryFee)} ج.م</Text>
                    </View>
                    {selectedOrder.tip > 0 ? (
                      <View style={[styles.priceRow, { flexDirection }]}>
                        <Text style={styles.priceLabel}>إكرامية الكابتن</Text>
                        <Text style={styles.priceValue}>{arDigits(selectedOrder.tip)} ج.م</Text>
                      </View>
                    ) : null}
                    {selectedOrder.discount > 0 ? (
                      <View style={[styles.priceRow, { flexDirection }]}>
                        <Text style={[styles.priceLabel, { color: colors.statusIssueText }]}>
                          خصم العرض
                        </Text>
                        <Text style={[styles.priceValue, { color: colors.statusIssueText }]}>
                          -{arDigits(selectedOrder.discount)} ج.م
                        </Text>
                      </View>
                    ) : null}
                    <View style={[styles.priceRow, styles.priceRowTotal, { flexDirection }]}>
                      <Text style={styles.priceLabelTotal}>الإجمالي المستحق</Text>
                      <Text style={styles.priceValueTotal}>{arDigits(selectedOrder.total)} ج.م</Text>
                    </View>

                    <View style={[styles.shareBlock, { flexDirection }]}>
                      <DollarSign size={14} color={colors.inkLight} />
                      <Text style={styles.shareText}>
                        طريقة الدفع: {selectedOrder.payment === 'cash' ? 'نقدي (كاش)' : 'محفظة دلنجاتُو'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Report issue action row */}
                {selectedOrder.status !== 'rejected' && selectedOrder.status !== 'cancelled' && (
                  <Pressable
                    onPress={() => setViewState('issue')}
                    style={[styles.reportIssueBar, { flexDirection }]}
                  >
                    <AlertTriangle size={16} color={colors.statusIssueText} />
                    <Text style={styles.reportIssueText}>الإبلاغ عن مشكلة في الطلب</Text>
                  </Pressable>
                )}
              </ScrollView>

              {/* Detail view active progress bar zone */}
              <View style={styles.actionZone}>
                {selectedOrder.status === 'new' && (
                  <View style={[styles.actionRowNew, { flexDirection, gap: 10 }]}>
                    <Pressable
                      disabled={loadingAction !== null}
                      onPress={() => setViewState('reject')}
                      style={[styles.actionBtn, styles.actionBtnReject, { flex: 1 }]}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.statusIssueText }]}>
                        رفض الطلب
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={loadingAction !== null}
                      onPress={() => handleAccept(selectedOrder.id)}
                      style={[styles.actionBtn, styles.actionBtnAccept, { flex: 2 }]}
                    >
                      {loadingAction === 'accept' ? (
                        <ActivityIndicator color={colors.canvas} size="small" />
                      ) : (
                        <Text style={[styles.actionBtnText, { color: colors.canvas }]}>
                          قبول الطلب
                        </Text>
                      )}
                    </Pressable>
                  </View>
                )}

                {selectedOrder.status === 'accepted' && (
                  <Pressable
                    disabled={loadingAction !== null}
                    onPress={() => handleStartPreparing(selectedOrder.id)}
                    style={[styles.actionBtn, styles.actionBtnAccept, { width: '100%' }]}
                  >
                    {loadingAction === 'prepare' ? (
                      <ActivityIndicator color={colors.canvas} size="small" />
                    ) : (
                      <Text style={[styles.actionBtnText, { color: colors.canvas }]}>
                        ابدأ التحضير
                      </Text>
                    )}
                  </Pressable>
                )}

                {selectedOrder.status === 'preparing' && (
                  <Pressable
                    disabled={loadingAction !== null}
                    onPress={() => handleMarkReady(selectedOrder.id)}
                    style={[styles.actionBtn, styles.actionBtnAccept, { width: '100%' }]}
                  >
                    {loadingAction === 'ready' ? (
                      <ActivityIndicator color={colors.canvas} size="small" />
                    ) : (
                      <Text style={[styles.actionBtnText, { color: colors.canvas }]}>
                        الطلب جاهز للاستلام
                      </Text>
                    )}
                  </Pressable>
                )}

                {selectedOrder.status === 'ready' && (
                  <Pressable
                    disabled={loadingAction !== null}
                    onPress={() => handleHandover(selectedOrder.id)}
                    style={[styles.actionBtn, styles.actionBtnAccept, { width: '100%' }]}
                  >
                    {loadingAction === 'handover' ? (
                      <ActivityIndicator color={colors.canvas} size="small" />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Truck size={18} color={colors.canvas} />
                        <Text style={[styles.actionBtnText, { color: colors.canvas }]}>
                          تسليم الكابتن الطلب
                        </Text>
                      </View>
                    )}
                  </Pressable>
                )}

                {selectedOrder.status === 'picked' || selectedOrder.status === 'delivered' ? (
                  <View style={[styles.staticDoneRow, { flexDirection }]}>
                    <CheckCircle size={20} color={colors.olive} />
                    <Text style={styles.staticDoneText}>
                      الطلب تم تسليمه للكابتن بنجاح ومكتمل حالياً.
                    </Text>
                  </View>
                ) : null}

                {selectedOrder.status === 'rejected' ? (
                  <View style={[styles.staticDoneRow, { flexDirection, borderColor: colors.statusIssue }]}>
                    <X size={20} color={colors.statusIssue} />
                    <Text style={[styles.staticDoneText, { color: colors.statusIssueText }]}>
                      الطلب مرفوض: {selectedOrder.rejectionReason}
                    </Text>
                  </View>
                ) : null}

                {selectedOrder.status === 'cancelled' ? (
                  <View style={[styles.staticDoneRow, { flexDirection, borderColor: colors.statusIssue }]}>
                    <AlertCircle size={20} color={colors.statusIssue} />
                    <Text style={[styles.staticDoneText, { color: colors.statusIssueText }]}>
                      الطلب ملغي: {selectedOrder.cancellationReason}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* Rejection Sub-View */}
          {viewState === 'reject' && (
            <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
              <View>
                <View style={[styles.subViewHeader, { flexDirection }]}>
                  <Text style={styles.subViewTitle}>سبب رفض الطلب</Text>
                  <Pressable onPress={() => setViewState('detail')} style={styles.closeBtn}>
                    <X size={20} color={colors.ink} />
                  </Pressable>
                </View>

                <Text style={[styles.subViewIntro, { textAlign: pick('right', 'left') }]}>
                  برجاء اختيار سبب الرفض لتوضيحه للعميل في شاشة التتبع:
                </Text>

                {/* Radio Choices */}
                {['item-out', 'store-closed', 'out-of-zone', 'other'].map((key) => {
                  const isSelected = rejectionReason === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setRejectionReason(key)}
                      style={[
                        styles.radioRow,
                        isSelected && styles.radioRowSelected,
                        { flexDirection },
                      ]}
                    >
                      <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                      <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                        {key === 'other' ? 'سبب آخر (اكتب بالأسفل)' : rejectionLabelFor(key)}
                      </Text>
                    </Pressable>
                  );
                })}

                {rejectionReason === 'other' && (
                  <TextInput
                    style={[styles.textInput, { textAlign: pick('right', 'left') }]}
                    placeholder="اكتب سبب الرفض بالتفصيل..."
                    placeholderTextColor={colors.inkMute}
                    value={customRejectionText}
                    onChangeText={setCustomRejectionText}
                    multiline
                  />
                )}
              </View>

              <View style={[styles.subViewButtons, { flexDirection, gap: 10 }]}>
                <Pressable
                  onPress={() => setViewState('detail')}
                  style={[styles.actionBtn, styles.actionBtnReject, { flex: 1 }]}
                >
                  <Text style={[styles.actionBtnText, { color: colors.statusIssueText }]}>
                    إلغاء
                  </Text>
                </Pressable>
                <Pressable
                  disabled={loadingAction !== null}
                  onPress={handleRejectSubmit}
                  style={[styles.actionBtn, styles.actionBtnAccept, { flex: 2 }]}
                >
                  {loadingAction === 'reject' ? (
                    <ActivityIndicator color={colors.canvas} size="small" />
                  ) : (
                    <Text style={[styles.actionBtnText, { color: colors.canvas }]}>
                      تأكيد الرفض
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Issue Reporting Sub-View */}
          {viewState === 'issue' && (
            <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
              <View>
                <View style={[styles.subViewHeader, { flexDirection }]}>
                  <Text style={styles.subViewTitle}>الإبلاغ عن مشكلة</Text>
                  <Pressable onPress={() => setViewState('detail')} style={styles.closeBtn}>
                    <X size={20} color={colors.ink} />
                  </Pressable>
                </View>

                <Text style={[styles.subViewIntro, { textAlign: pick('right', 'left') }]}>
                  اختر تصنيف المشكلة لشرحها لخدمة العملاء:
                </Text>

                {/* Radio Choices */}
                {(['item-out', 'wrong-address', 'customer-unreachable', 'delay', 'damage', 'other'] as IssueReportCategory[]).map(
                  (key) => {
                    const isSelected = issueCategory === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => setIssueCategory(key)}
                        style={[
                          styles.radioRow,
                          isSelected && styles.radioRowSelected,
                          { flexDirection },
                        ]}
                      >
                        <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                        <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                          {issueLabelFor(key)}
                        </Text>
                      </Pressable>
                    );
                  },
                )}

                <TextInput
                  style={[styles.textInput, { textAlign: pick('right', 'left') }]}
                  placeholder="تفاصيل إضافية عن المشكلة..."
                  placeholderTextColor={colors.inkMute}
                  value={issueDescription}
                  onChangeText={setIssueDescription}
                  multiline
                />
              </View>

              <View style={[styles.subViewButtons, { flexDirection, gap: 10 }]}>
                <Pressable
                  onPress={() => setViewState('detail')}
                  style={[styles.actionBtn, styles.actionBtnReject, { flex: 1 }]}
                >
                  <Text style={[styles.actionBtnText, { color: colors.statusIssueText }]}>
                    إلغاء
                  </Text>
                </Pressable>
                <Pressable
                  disabled={loadingAction !== null}
                  onPress={handleIssueSubmit}
                  style={[styles.actionBtn, styles.actionBtnAccept, { flex: 2 }]}
                >
                  {loadingAction === 'issue' ? (
                    <ActivityIndicator color={colors.canvas} size="small" />
                  ) : (
                    <Text style={[styles.actionBtnText, { color: colors.canvas }]}>
                      إرسال البلاغ
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row-reverse',
    backgroundColor: colors.olive,
  },
  headerTitle: {
    fontFamily: fonts.arabicBold,
    fontSize: 20,
    color: colors.canvas,
  },
  onlineBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(250,248,243,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  onlineText: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 12,
    color: colors.canvas,
  },
  tabsRow: {
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.canvas300,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(31,74,61,0.08)',
  },
  tabText: {
    fontFamily: fonts.arabicMedium,
    fontSize: 13,
    color: colors.inkMute,
  },
  tabTextActive: {
    fontFamily: fonts.arabicBold,
    color: colors.olive,
  },
  tabBadge: {
    borderRadius: 100,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: colors.gold,
  },
  tabBadgeInactive: {
    backgroundColor: colors.canvas200,
  },
  tabBadgeText: {
    fontFamily: fonts.arabicBold,
    fontSize: 10,
    lineHeight: 11,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: 16,
    ...shadow.card,
    borderWidth: 1,
    borderColor: colors.canvas300,
  },
  orderCardPressed: {
    backgroundColor: colors.canvas200,
  },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontFamily: fonts.arabicBold,
    fontSize: 13,
    color: colors.inkLight,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 10,
  },
  timeText: {
    fontFamily: fonts.arabicMedium,
    fontSize: 12,
    color: colors.inkMute,
  },
  customerName: {
    fontFamily: fonts.arabicBold,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 6,
  },
  itemsRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsText: {
    fontFamily: fonts.arabic,
    fontSize: 13.5,
    color: colors.inkLight,
  },
  cardFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.canvas300,
  },
  footerSubText: {
    fontFamily: fonts.arabicMedium,
    fontSize: 12,
    color: colors.inkLight,
  },
  orderTotal: {
    fontFamily: fonts.arabicBold,
    fontSize: 16,
    color: colors.olive,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.arabicBold,
    fontSize: 18,
    color: colors.ink,
  },
  emptySub: {
    fontFamily: fonts.arabic,
    fontSize: 13.5,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  backBar: {
    height: 48,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.canvas300,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  backBarText: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 14,
    color: colors.olive,
  },
  detailScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  detailCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    padding: 18,
    ...shadow.card,
    borderWidth: 1,
    borderColor: colors.canvas300,
    marginBottom: 16,
  },
  detailHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailId: {
    fontFamily: fonts.arabicBold,
    fontSize: 18,
    color: colors.ink,
  },
  detailTime: {
    fontFamily: fonts.arabic,
    fontSize: 12,
    color: colors.inkMute,
    marginTop: 2,
  },
  sectionBlock: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.canvas300,
  },
  customerInfo: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: 'rgba(31,74,61,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.arabicBold,
    fontSize: 18,
    color: colors.olive,
  },
  detailCustomerName: {
    fontFamily: fonts.arabicBold,
    fontSize: 16,
    color: colors.ink,
  },
  detailCustomerPhone: {
    fontFamily: fonts.arabicMedium,
    fontSize: 13,
    color: colors.inkLight,
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: colors.canvas200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  addressText: {
    fontFamily: fonts.arabic,
    fontSize: 13.5,
    color: colors.ink,
  },
  noteRow: {
    alignItems: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(232,177,79,0.08)',
    padding: 8,
    borderRadius: 8,
  },
  noteText: {
    fontFamily: fonts.arabicMedium,
    fontSize: 13,
    color: colors.statusPendingText,
  },
  sectionTitle: {
    fontFamily: fonts.arabicBold,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 10,
  },
  detailItemRow: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  detailItemName: {
    fontFamily: fonts.arabicMedium,
    fontSize: 14,
    color: colors.ink,
  },
  detailItemSub: {
    fontFamily: fonts.arabic,
    fontSize: 12,
    color: colors.inkLight,
    marginTop: 2,
  },
  detailItemQty: {
    fontFamily: fonts.arabicBold,
    fontSize: 14,
    color: colors.olive,
  },
  detailItemPrice: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 13.5,
    color: colors.ink,
    minWidth: 54,
    textAlign: 'left',
  },
  priceRow: {
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontFamily: fonts.arabic,
    fontSize: 13.5,
    color: colors.inkLight,
  },
  priceValue: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  priceRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.canvas300,
    marginTop: 8,
    paddingTop: 8,
  },
  priceLabelTotal: {
    fontFamily: fonts.arabicBold,
    fontSize: 15,
    color: colors.ink,
  },
  priceValueTotal: {
    fontFamily: fonts.arabicBold,
    fontSize: 17,
    color: colors.olive,
  },
  shareBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.canvas200,
    borderRadius: 8,
  },
  shareText: {
    fontFamily: fonts.arabicMedium,
    fontSize: 12,
    color: colors.inkLight,
  },
  reportIssueBar: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(197,59,44,0.15)',
    backgroundColor: 'rgba(197,59,44,0.04)',
    borderRadius: 10,
    marginBottom: 20,
  },
  reportIssueText: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 13,
    color: colors.statusIssueText,
  },
  actionZone: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.canvas300,
    padding: 16,
    ...shadow.lift,
  },
  actionRowNew: {
    justifyContent: 'space-between',
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnAccept: {
    backgroundColor: colors.olive,
  },
  actionBtnReject: {
    borderWidth: 1.5,
    borderColor: colors.statusIssue,
    backgroundColor: 'transparent',
  },
  actionBtnText: {
    fontFamily: fonts.arabicBold,
    fontSize: 15,
  },
  staticDoneRow: {
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(31,74,61,0.2)',
    backgroundColor: 'rgba(31,74,61,0.03)',
  },
  staticDoneText: {
    fontFamily: fonts.arabicMedium,
    fontSize: 13.5,
    color: colors.olive,
    flex: 1,
  },
  subViewHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subViewTitle: {
    fontFamily: fonts.arabicBold,
    fontSize: 20,
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas200,
    borderRadius: 100,
  },
  subViewIntro: {
    fontFamily: fonts.arabicMedium,
    fontSize: 14,
    color: colors.inkLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  radioRow: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.canvas300,
    marginBottom: 10,
  },
  radioRowSelected: {
    borderColor: colors.olive,
    backgroundColor: 'rgba(31,74,61,0.04)',
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.inkMute,
  },
  radioDotSelected: {
    borderColor: colors.olive,
    backgroundColor: colors.olive,
  },
  radioLabel: {
    fontFamily: fonts.arabic,
    fontSize: 14,
    color: colors.ink,
  },
  radioLabelSelected: {
    fontFamily: fonts.arabicSemiBold,
    color: colors.olive,
  },
  textInput: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.canvas300,
    backgroundColor: colors.bgElevated,
    padding: 12,
    fontFamily: fonts.arabic,
    fontSize: 14,
    color: colors.ink,
    marginTop: 8,
  },
  subViewButtons: {
    marginTop: 20,
  },
});
