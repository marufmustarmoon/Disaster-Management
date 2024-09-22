import { useEffect, useState } from 'react';
import inventoryService from '../services/inventoryService';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', item_type: 'relief' });
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);


  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  
  const handleAddInventory = async () => {
    try {
      await inventoryService.addInventory(newItem);
      fetchInventory(); // Refresh inventory list
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding inventory:', error);
    }
  };

 
  const handleUpdateInventory = async () => {
    try {
      if (editingItem) {
        await inventoryService.updateInventory(editingItem.id, editingItem);
        fetchInventory(); 
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  
  const handleDeleteInventory = async (itemId) => {
    try {
      await inventoryService.deleteInventory(itemId);
      fetchInventory(); 
    } catch (error) {
      console.error('Error deleting inventory:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

     
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 mb-6"
      >
        Add Inventory
      </button>

      
      <ul className="space-y-4">
        {inventory.length === 0 ? (
          <p>No inventory items found.</p>
        ) : (
          inventory.map((item) => (
            <li key={item.id} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">{item.item_name}</h2>
              <p className="text-gray-700 mb-2">
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Type:</strong> {item.item_type === 'relief' ? 'Relief Goods' : 'Expense'}
              </p>
              <div className="flex space-x-4">
               
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowEditModal(true);
                  }}
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Edit
                </button>
               
                <button
                  onClick={() => handleDeleteInventory(item.id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

     
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Add Inventory</h2>
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.item_name}
              onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            />
            <select
              value={newItem.item_type}
              onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            >
              <option value="relief">Relief Goods</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="number"
              placeholder="Expense Amount"
              value={editingItem.expense}
              onChange={(e) => setNewItem({ ...newItem, expense: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleAddInventory}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Edit Inventory</h2>
            <input
              type="text"
              placeholder="Item Name"
              value={editingItem.item_name}
              onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={editingItem.quantity}
              onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            />

            <select
              value={editingItem.item_type}
              onChange={(e) => setEditingItem({ ...editingItem, item_type: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            >
              <option value="relief">Relief Goods</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="number"
              placeholder="Expense Amount"
              value={editingItem.expense}
              onChange={(e) => setEditingItem({ ...editingItem, expense: e.target.value })}
              className="block w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleUpdateInventory}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
