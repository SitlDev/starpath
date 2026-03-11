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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Personal Growth', 'Career', 'Health', 'Creative', 'Learning', 'Finance', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function AddIdeaScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [category, setCategory] = useState('Personal Growth');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState(['']);

  const addTask = () => {
    if (tasks.length < 10) {
      setTasks([...tasks, '']);
    }
  };

  const updateTask = (index, text) => {
    const newTasks = [...tasks];
    newTasks[index] = text;
    setTasks(newTasks);
  };

  const removeTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks.length === 0 ? [''] : newTasks);
  };

  const saveIdea = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please give your idea a title');
      return;
    }
    if (!motivation.trim()) {
      Alert.alert('Missing Motivation', 'Why does this matter to you? This will keep you motivated!');
      return;
    }

    // Check active project limit
    const stored = await AsyncStorage.getItem('ideas');
    const allIdeas = stored ? JSON.parse(stored) : [];
    const activeCount = allIdeas.filter(
      idea => idea.status === 'active' || idea.status === 'started'
    ).length;

    if (activeCount >= 3) {
      Alert.alert(
        'Too Many Active Projects',
        'You already have 3 active projects. Complete or park one before starting another!',
        [{ text: 'OK' }]
      );
      return;
    }

    const newIdea = {
      id: Date.now().toString(),
      title: title.trim(),
      motivation: motivation.trim(),
      category,
      priority,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastTouched: new Date().toISOString(),
      tasks: tasks
        .filter(t => t.trim())
        .map((text, idx) => ({
          id: `t${Date.now()}-${idx}`,
          text: text.trim(),
          completed: false,
        })),
      notes: notes.trim(),
      timeSpent: 0,
    };

    allIdeas.push(newIdea);
    await AsyncStorage.setItem('ideas', JSON.stringify(allIdeas));

    Alert.alert('Idea Added!', `"${title}" is now in your active projects`, [
      {
        text: 'OK',
        onPress: () => {
          // Reset form
          setTitle('');
          setMotivation('');
          setCategory('Personal Growth');
          setPriority('medium');
          setNotes('');
          setTasks(['']);
          navigation.navigate('Ideas');
        },
      },
    ]);
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return '#FF6B35';
      case 'medium': return '#F7B801';
      case 'low': return '#4ECDC4';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="bulb" size={40} color="#FF6B35" />
          <Text style={styles.headerTitle}>Capture Your Idea</Text>
          <Text style={styles.headerSubtitle}>
            What do you want to make real?
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Learn guitar, Start a podcast..."
            placeholderTextColor="#555"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Why This Matters to You *</Text>
          <Text style={styles.helperText}>
            This is your anchor. When motivation fades, this reminder will bring you back.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., I want to perform at my daughter's wedding..."
            placeholderTextColor="#555"
            value={motivation}
            onChangeText={setMotivation}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && { backgroundColor: getPriorityColor(p) },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextSelected,
                  ]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Initial Tasks</Text>
            <TouchableOpacity onPress={addTask} disabled={tasks.length >= 10}>
              <Text style={[styles.addTaskText, tasks.length >= 10 && styles.disabledText]}>
                + Add Task
              </Text>
            </TouchableOpacity>
          </View>
          {tasks.map((task, index) => (
            <View key={index} style={styles.taskRow}>
              <TextInput
                style={[styles.input, styles.taskInput]}
                placeholder={`Task ${index + 1}`}
                placeholderTextColor="#555"
                value={task}
                onChangeText={text => updateTask(index, text)}
              />
              {tasks.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeTask(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional thoughts or context..."
            placeholderTextColor="#555"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveIdea}>
          <Text style={styles.saveButtonText}>Save Idea</Text>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  priorityTextSelected: {
    color: '#FFF',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  disabledText: {
    color: '#444',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  taskInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});
