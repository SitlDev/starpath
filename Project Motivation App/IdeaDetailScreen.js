import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STATUSES = ['active', 'started', 'parked', 'completed'];

export default function IdeaDetailScreen({ route, navigation }) {
  const { ideaId } = route.params;
  const [idea, setIdea] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadIdea();
  }, []);

  const loadIdea = async () => {
    const stored = await AsyncStorage.getItem('ideas');
    if (stored) {
      const ideas = JSON.parse(stored);
      const found = ideas.find(i => i.id === ideaId);
      if (found) {
        setIdea(found);
        setNotes(found.notes || '');
      }
    }
  };

  const updateIdea = async (updates) => {
    const stored = await AsyncStorage.getItem('ideas');
    const ideas = JSON.parse(stored);
    const index = ideas.findIndex(i => i.id === ideaId);
    
    ideas[index] = {
      ...ideas[index],
      ...updates,
      lastTouched: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('ideas', JSON.stringify(ideas));
    setIdea(ideas[index]);
  };

  const toggleTask = async (taskId) => {
    const updatedTasks = idea.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await updateIdea({ tasks: updatedTasks });
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    const task = {
      id: `t${Date.now()}`,
      text: newTask.trim(),
      completed: false,
    };
    
    await updateIdea({ tasks: [...idea.tasks, task] });
    setNewTask('');
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = idea.tasks.filter(t => t.id !== taskId);
    await updateIdea({ tasks: updatedTasks });
  };

  const saveNotes = async () => {
    await updateIdea({ notes });
    setEditingNotes(false);
  };

  const changeStatus = async (newStatus) => {
    if (newStatus === 'completed') {
      Alert.alert(
        '🎉 Congratulations!',
        `You completed "${idea.title}"! This is a big win.`,
        [
          { text: 'Keep in Archive', onPress: async () => {
            await updateIdea({ status: newStatus });
            navigation.goBack();
          }},
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      await updateIdea({ status: newStatus });
    }
  };

  const deleteIdea = async () => {
    Alert.alert(
      'Delete Idea',
      `Are you sure you want to delete "${idea.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const stored = await AsyncStorage.getItem('ideas');
            const ideas = JSON.parse(stored);
            const filtered = ideas.filter(i => i.id !== ideaId);
            await AsyncStorage.setItem('ideas', JSON.stringify(filtered));
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!idea) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const progress = idea.tasks.length > 0
    ? Math.round((idea.tasks.filter(t => t.completed).length / idea.tasks.length) * 100)
    : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6B35';
      case 'medium': return '#F7B801';
      case 'low': return '#4ECDC4';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4ECDC4';
      case 'started': return '#F7B801';
      case 'parked': return '#666';
      case 'completed': return '#4ECDC4';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{idea.title}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(idea.priority) }]}>
            <Text style={styles.badgeText}>{idea.priority.toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(idea.status) }]}>
            <Text style={styles.badgeText}>{idea.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.category}>{idea.category}</Text>
      </View>

      <View style={styles.motivationCard}>
        <View style={styles.motivationHeader}>
          <Ionicons name="heart" size={24} color="#FF6B35" />
          <Text style={styles.motivationLabel}>Why This Matters</Text>
        </View>
        <Text style={styles.motivationText}>{idea.motivation}</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Text style={styles.progressPercentage}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressStats}>
          {idea.tasks.filter(t => t.completed).length} of {idea.tasks.length} tasks completed
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {idea.tasks.map(task => (
          <View key={task.id} style={styles.taskItem}>
            <TouchableOpacity
              style={styles.taskCheckbox}
              onPress={() => toggleTask(task.id)}
            >
              {task.completed ? (
                <Ionicons name="checkmark-circle" size={28} color="#4ECDC4" />
              ) : (
                <Ionicons name="ellipse-outline" size={28} color="#666" />
              )}
            </TouchableOpacity>
            <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
              {task.text}
            </Text>
            <TouchableOpacity onPress={() => deleteTask(task.id)}>
              <Ionicons name="trash-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
        
        <View style={styles.addTaskRow}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="Add a new task..."
            placeholderTextColor="#555"
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity onPress={addTask} style={styles.addTaskButton}>
            <Ionicons name="add-circle" size={32} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {!editingNotes && (
            <TouchableOpacity onPress={() => setEditingNotes(true)}>
              <Ionicons name="create-outline" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        {editingNotes ? (
          <View>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholder="Add notes, ideas, or reflections..."
              placeholderTextColor="#555"
            />
            <View style={styles.notesButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNotes(idea.notes || '');
                  setEditingNotes(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveNotesButton} onPress={saveNotes}>
                <Text style={styles.saveNotesButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.notesText}>
            {idea.notes || 'No notes yet. Tap the edit icon to add some.'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Status</Text>
        <View style={styles.statusButtons}>
          {STATUSES.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                idea.status === status && styles.statusButtonActive,
              ]}
              onPress={() => changeStatus(status)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  idea.status === status && styles.statusButtonTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={deleteIdea}>
        <Ionicons name="trash" size={20} color="#FF6B35" />
        <Text style={styles.deleteButtonText}>Delete Idea</Text>
      </TouchableOpacity>

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>
          Created {new Date(idea.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.metaText}>
          Last updated {new Date(idea.lastTouched).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  category: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  motivationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  motivationText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  progressCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  progressStats: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  taskCheckbox: {
    padding: 4,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#FFF',
  },
  addTaskButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  notesInput: {
    minHeight: 120,
    paddingTop: 16,
  },
  notesButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  saveNotesButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  saveNotesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  notesText: {
    fontSize: 15,
    color: '#CCC',
    lineHeight: 22,
    fontStyle: idea => idea.notes ? 'normal' : 'italic',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  statusButtonTextActive: {
    color: '#FFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B35',
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  metaInfo: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
