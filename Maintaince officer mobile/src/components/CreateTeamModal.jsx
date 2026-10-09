import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { X, Search, Plus, UserPlus } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function CreateTeamModal({ visible, onClose, onCreated }) {
  const [teamName, setTeamName] = useState('');
  const [specialization, setSpecialization] = useState('Electrical');
  const [lead, setLead] = useState('David Chen');
  const [leadSearch, setLeadSearch] = useState('');
  const [showLeadList, setShowLeadList] = useState(false);
  const [members, setMembers] = useState(['Kasun Perera', 'Sunil Shantha']);
  const [newMemberText, setNewMemberText] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const availablePersonnel = [
    'David Chen - Lead Technician',
    'Sarah Jenkins - HVAC Specialist',
    'Marcus Johnson - Senior Plumber',
    'Kasun Perera - Senior Electrician',
    'Nimal Fernando - Plumbing Specialist',
    'Saman Wijesiri - Civil Foreman',
    'Tharindu Silva - HVAC Tech',
    'Chaminda Jayasena - Master Carpenter'
  ];

  const handleAddMember = () => {
    if (newMemberText.trim() && !members.includes(newMemberText.trim())) {
      setMembers([...members, newMemberText.trim()]);
      setNewMemberText('');
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (name) => {
    setMembers(members.filter(m => m !== name));
  };

  const handleSubmit = () => {
    if (!teamName.trim()) {
      Alert.alert('Required Field', 'Please enter a team name');
      return;
    }
    if (onCreated) {
      onCreated({
        name: teamName.trim(),
        specialization,
        lead,
        members: members.length > 0 ? members : ['David Chen', 'Kasun Perera']
      });
    }
    setTeamName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New Maintenance Team</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Team Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>TEAM NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Team D - Electrical"
                placeholderTextColor="#94a3b8"
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>

            {/* Specialization */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>SPECIALIZATION</Text>
              <View style={styles.pillRow}>
                {[
                  'Electrical',
                  'HVAC & Climate',
                  'Plumbing',
                  'Civil & Structural',
                  'Carpentry'
                ].map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => setSpecialization(spec)}
                    style={[
                      styles.specPill,
                      specialization === spec && styles.specPillActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.specPillText,
                        specialization === spec && styles.specPillTextActive
                      ]}
                    >
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Lead Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ASSIGN LEAD / SUPERVISOR</Text>
              <TouchableOpacity
                onPress={() => setShowLeadList(!showLeadList)}
                style={styles.leadSelector}
              >
                <Search size={16} color="#94a3b8" />
                <Text style={styles.leadSelectedText}>{lead || 'Select Leader...'}</Text>
              </TouchableOpacity>

              {showLeadList && (
                <View style={styles.dropdownList}>
                  {availablePersonnel.map((p, idx) => {
                    const name = p.split(' - ')[0];
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          setLead(name);
                          setShowLeadList(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownItemText}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Members Chips */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>INITIAL MEMBERS</Text>
              <View style={styles.chipsContainer}>
                {members.map((m, idx) => (
                  <View key={idx} style={styles.chip}>
                    <Text style={styles.chipText}>{m}</Text>
                    <TouchableOpacity onPress={() => handleRemoveMember(m)}>
                      <X size={12} color="#475569" />
                    </TouchableOpacity>
                  </View>
                ))}

                {showAddMember ? (
                  <View style={styles.addMemberInputRow}>
                    <TextInput
                      style={styles.inlineInput}
                      placeholder="Member name..."
                      placeholderTextColor="#94a3b8"
                      value={newMemberText}
                      onChangeText={setNewMemberText}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleAddMember} style={styles.inlineAddBtn}>
                      <Text style={styles.inlineAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowAddMember(true)}
                    style={styles.addMemberTrigger}
                  >
                    <Plus size={14} color="#7a1521" />
                    <Text style={styles.addMemberTriggerText}>Add Member</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Create Team</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%'
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
    marginBottom: 18
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#ffffff'
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  specPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  specPillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  specPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  specPillTextActive: {
    color: '#ffffff'
  },
  leadSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 10,
    backgroundColor: '#ffffff'
  },
  leadSelectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b'
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    maxHeight: 160
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#334155'
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    minHeight: 50,
    alignItems: 'center'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6
  },
  chipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500'
  },
  addMemberTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  addMemberTriggerText: {
    fontSize: 12,
    color: '#7a1521',
    fontWeight: '600'
  },
  addMemberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  inlineInput: {
    height: 32,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    width: 120
  },
  inlineAddBtn: {
    backgroundColor: '#7a1521',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  inlineAddBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 10
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  submitBtn: {
    backgroundColor: '#7a1521',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  }
});
