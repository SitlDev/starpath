import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ArchiveScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState('all'); // all, completed, parked
  const [refreshing, setRefreshing] = useState(false);

  const loadIdeas = async () => {
    const stored = await AsyncStorage.getItem('ideas');
    if (stored) {
      const allIdeas = JSON.parse(stored);
      const archivedIdeas = allIdeas.filter(
        idea => idea.status === 'completed' || idea.status === 'parked'
      );
      setIdeas(archivedIdeas);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIdeas();
    setRefreshing(false);
  };

  const getFilteredIdeas = () => {
    if (filter === 'all') return ideas;
    return ideas.filter(idea => idea.status === filter);
  };

  const renderIdea = ({ item }) => {
    const isCompleted = item.status === 'completed';
    const progress = item.tasks.length > 0
      ? Math.round((item.tasks.filter(t => t.completed).length / item.tasks.length) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={[styles.ideaCard, isCompleted && styles.completedCard]}
        onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.ideaHeader}>
          <View style={styles.titleRow}>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            )}
            {item.status === 'parked' && (
              <Ionicons name="pause-circle" size={24} color="#F7B801" />
            )}
            <Text style={styles.ideaTitle}>{item.title}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isCompleted ? '#4ECDC4' : '#F7B801' }
          ]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.category}>{item.category}</Text>

        {isCompleted && (
          <View style={styles.celebrationBox}>
            <Text style={styles.celebrationText}>
              🎉 Completed! {item.motivation}
            </Text>
          </View>
        )}

        {item.status === 'parked' && (
          <View style={styles.parkedBox}>
            <Text style={styles.parkedText}>
              {item.motivation}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Progress: {progress}%
          </Text>
          <Text style={styles.metaText}>
            {new Date(item.lastTouched).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredIdeas = getFilteredIdeas();
  const completedCount = ideas.filter(i => i.status === 'completed').length;
  const parkedCount = ideas.filter(i => i.status === 'parked').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Archive</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{parkedCount}</Text>
            <Text style={styles.statLabel}>Parked</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({ideas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'parked' && styles.filterButtonActive]}
          onPress={() => setFilter('parked')}
        >
          <Text style={[styles.filterText, filter === 'parked' && styles.filterTextActive]}>
            Parked ({parkedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredIdeas.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="archive-outline" size={80} color="#333" />
          <Text style={styles.emptyTitle}>
            {filter === 'completed' ? 'No Completed Projects' : 
             filter === 'parked' ? 'No Parked Projects' : 
             'Archive Empty'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'completed' 
              ? 'Complete a project to see it here'
              : filter === 'parked'
              ? 'Park a project to revisit later'
              : 'Completed and parked projects will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredIdeas}
          renderItem={renderIdea}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B35"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  ideaCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  completedCard: {
    borderColor: '#4ECDC4',
  },
  ideaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  ideaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  category: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  celebrationBox: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  celebrationText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  parkedBox: {
    backgroundColor: 'rgba(247, 184, 1, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#F7B801',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  parkedText: {
    fontSize: 14,
    color: '#CCC',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
