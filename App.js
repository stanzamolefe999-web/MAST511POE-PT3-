import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// --- REUSABLE COMPONENT: Menu Item Card ---
function MenuItemCard({ item, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetail}>Course: {item.course}</Text>
      <Text style={styles.itemDetail}>Price: R{item.price}</Text>
      <Text style={styles.itemDetail}>Description: {item.description}</Text>
      <View style={styles.cardButtons}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- REUSABLE COMPONENT: Stats Box ---
function StatsBox({ menuItems }) {
  const totalItems = menuItems.length;
  const totalPrice = menuItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const averagePrice = totalItems > 0 ? (totalPrice / totalItems).toFixed(2) : '0.00';
  const starters = menuItems.filter(i => i.course === 'Starter').length;
  const mains = menuItems.filter(i => i.course === 'Main Course').length;
  const desserts = menuItems.filter(i => i.course === 'Dessert').length;

  return (
    <View style={styles.statsBox}>
      <Text style={styles.statsTitle}>📊 Menu Statistics</Text>
      <Text style={styles.statsText}>Total Menu Items: {totalItems}</Text>
      <Text style={styles.statsText}>Average Price: R{averagePrice}</Text>
      <Text style={styles.statsText}>Starters: {starters} | Main Course: {mains} | Dessert: {desserts}</Text>
    </View>
  );
}

export default function App() {
  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'Pap and Wors', course: 'Main Course', price: '85', description: 'Traditional pap with wors' },
    { id: '2', name: 'Malva Pudding', course: 'Dessert', price: '60', description: 'Warm pudding with custard' },
  ]);

  const [name, setName] = useState('');
  const [course, setCourse] = useState('Starter');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  // --- VALIDATION FUNCTION (reusable) ---
  const validateInputs = () => {
    if (!name.trim() || !price.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields: Name, Price and Description');
      return false;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Price must be a number greater than 0');
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setName(''); setPrice(''); setDescription(''); setCourse('Starter'); setEditingId(null);
  };

  // --- ADD / UPDATE ---
  const handleSaveItem = () => {
    if (!validateInputs()) return;

    if (editingId) {
      // UPDATE existing
      setMenuItems(menuItems.map(item =>
        item.id === editingId ? { ...item, name, course, price, description } : item
      ));
      Alert.alert('Success', 'Menu item updated successfully!');
    } else {
      // ADD new
      const newItem = { id: Date.now().toString(), name, course, price, description };
      setMenuItems([...menuItems, newItem]);
      Alert.alert('Success', 'Menu item added successfully!');
    }
    clearForm();
  };

  const handleEditItem = (item) => {
    setName(item.name); setCourse(item.course); setPrice(item.price); setDescription(item.description); setEditingId(item.id);
  };

  const handleDeleteItem = (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setMenuItems(menuItems.filter(item => item.id !== id));
        Alert.alert('Deleted', 'Menu item deleted');
      }}
    ]);
  };

  // --- SEARCH + FILTER LOGIC ---
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filterCourse === 'All' || item.course === filterCourse;
    return matchesSearch && matchesFilter;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chef's Menu Manager</Text>
      <Text style={styles.subtitle}>Christoffel's Kitchen - Part 3</Text>

      <StatsBox menuItems={menuItems} />

      {/* ADD / EDIT FORM */}
      <Text style={styles.sectionTitle}>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</Text>
      <TextInput style={styles.input} placeholder="Dish Name e.g. Pap and Wors" value={name} onChangeText={setName} />
      <View style={styles.pickerBox}>
        <Picker selectedValue={course} onValueChange={setCourse}>
          <Picker.Item label="Starter" value="Starter" />
          <Picker.Item label="Main Course" value="Main Course" />
          <Picker.Item label="Dessert" value="Dessert" />
        </Picker>
      </View>
      <TextInput style={styles.input} placeholder="Price e.g. 85" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveItem}>
        <Text style={styles.btnText}>{editingId ? 'Update Item' : 'Add Item'}</Text>
      </TouchableOpacity>
      {editingId && (
        <TouchableOpacity style={styles.cancelBtn} onPress={clearForm}>
          <Text style={styles.btnText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}

      {/* SEARCH + FILTER */}
      <Text style={styles.sectionTitle}>Search & Filter</Text>
      <TextInput style={styles.input} placeholder="Search by name..." value={searchText} onChangeText={setSearchText} />
      <View style={styles.filterRow}>
        {['All', 'Starter', 'Main Course', 'Dessert'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filterCourse === f && styles.filterActive]} onPress={() => setFilterCourse(f)}>
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => { setSearchText(''); setFilterCourse('All'); }}>
        <Text style={styles.clearText}>Clear Search / Filter - Show All</Text>
      </TouchableOpacity>

      {/* LIST */}
      <Text style={styles.sectionTitle}>Menu Items ({filteredItems.length})</Text>
      {filteredItems.length === 0 ? (
        <Text style={styles.emptyText}>No items found. Try clearing search.</Text>
      ) : (
        filteredItems.map(item => (
          <MenuItemCard key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E1', padding: 16 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginTop: 10, color: '#E65100' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 },
  pickerBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10 },
  saveBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#757575', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  statsBox: { backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#FFCC80' },
  statsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  statsText: { fontSize: 14, marginBottom: 2 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  filterBtn: { backgroundColor: '#FFE0B2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  filterActive: { backgroundColor: '#E65100' },
  filterText: { fontWeight: '600' },
  clearText: { color: '#1565C0', textAlign: 'center', marginVertical: 6, fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemDetail: { fontSize: 13, color: '#555', marginTop: 2 },
  cardButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editBtn: { backgroundColor: '#1565C0', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#C62828', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },
});