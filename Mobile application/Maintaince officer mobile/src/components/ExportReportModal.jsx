import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function ExportReportModal({ visible, onClose, onExport }) {
  const [reportType, setReportType] = useState('Monthly Summary');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [format, setFormat] = useState('PDF');

  const reportTypes = [
    'Monthly Summary',
    'Building Wise Summary',
    'Labourer Performance',
    'Category Breakdown',
    'Inventory / Stock Usage'
  ];

  const handleExport = () => {
    if (onExport) {
      onExport({ reportType, startDate, endDate, format });
    }
    Alert.alert('Report Exported', `Report (${reportType}) exported as ${format} successfully!`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Export Maintenance Report</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Report Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>REPORT TYPE</Text>
            <View style={styles.pillRow}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setReportType(type)}
                  style={[styles.pill, reportType === type && styles.pillActive]}
                >
                  <Text style={[styles.pillText, reportType === type && styles.pillTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.dateRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>START DATE</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>END DATE</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Format Radio / Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>FORMAT</Text>
            <View style={styles.formatRow}>
              {['PDF', 'Excel', 'CSV'].map((fmt) => (
                <TouchableOpacity
                  key={fmt}
                  onPress={() => setFormat(fmt)}
                  style={[styles.formatBtn, format === fmt && styles.formatBtnActive]}
                >
                  <Text style={[styles.formatBtnText, format === fmt && styles.formatBtnTextActive]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExport} style={styles.submitBtn}>
              <Download size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Export Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },
  closeBtn: {
    padding: 4
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  pillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  pillTextActive: {
    color: '#ffffff'
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1e293b'
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  formatBtnActive: {
    backgroundColor: '#ffe9e8',
    borderColor: '#7a1521'
  },
  formatBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  formatBtnTextActive: {
    color: '#7a1521',
    fontWeight: '700'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 12
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600'
  },
  submitBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  }
});
