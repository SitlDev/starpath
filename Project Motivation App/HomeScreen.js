import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadIdeas = async () => {
    const stored = await AsyncStorage.getItem('ideas');
    if (stored) {
      const allIdeas = JSON.parse(stored);
      const activeIdeas = allIdeas.filter(
        idea => idea.status === 'active' || idea.status === 'started'
      );
      setIdeas(activeIdeas);
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

  const getDaysSinceLastTouched = (lastTouched) => {
    const days = Math.floor(
      (Date.now() - new Date(lastTouched).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6B35';
      case 'medium': return '#F7B801';
      case 'low': return '#4ECDC4';
      default: return '#666';
    }
  };

  const getProgressPercentage = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const renderIdea = ({ item }) => {
    const daysSince = getDaysSinceLastTouched(item.lastTouched);
    const progress = getProgressPercentage(item.tasks);
    const isStale = daysSince >= 7;

    return (
      <TouchableOpacity
        style={[styles.ideaCard, isStale && styles.staleCard]}
        onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
        activeOpacity={0.7}
      >
        {isStale && (
          <View style={styles.staleBadge}>
            <Ionicons name="warning" size={14} color="#FF6B35" />
            <Text style={styles.staleText}>Stale {daysSince}d</Text>
          </View>
        )}
        
        <View style={styles.ideaHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
            <Text style={styles.ideaTitle}>{item.title}</Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>

        <View style={styles.motivationBox}>
          <Ionicons name="heart" size={16} color="#FF6B35" />
          <Text style={styles.motivationText} numberOfLines={2}>
            {item.motivation}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {item.tasks?.length || 0} tasks
          </Text>
          <Text style={styles.metaText}>
            Last updated {daysSince === 0 ? 'today' : `${daysSince}d ago`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const activeCount = ideas.length;
  const showWarning = activeCount >= 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Projects</Text>
        <View style={styles.headerStats}>
          <Text style={[styles.activeCount, showWarning && styles.warningText]}>
            {activeCount}/3
          </Text>
          {showWarning && (
            <Ionicons name="alert-circle" size={20} color="#F7B801" />
          )}
        </View>
      </View>

      {showWarning && (
        <View style={styles.warningBox}>
          <Text style={styles.warningBoxText}>
            ⚠️ You're at max capacity! Focus on completing one before starting another.
          </Text>
        </View>
      )}

      {ideas.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={80} color="#333" />
          <Text style={styles.emptyTitle}>No Active Projects</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your first idea
          </Text>
        </View>
      ) : (
        <FlatList
          data={ideas}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  warningText: {
    color: '#F7B801',
  },
  warningBox: {
    backgroundColor: 'rgba(247, 184, 1, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#F7B801',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  warningBoxText: {
    color: '#F7B801',
    fontSize: 14,
    fontWeight: '600',
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
    position: 'relative',
  },
  staleCard: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  staleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  staleText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '700',
  },
  ideaHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ideaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  category: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  motivationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECDC4',
    width: 45,
    textAlign: 'right',
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
