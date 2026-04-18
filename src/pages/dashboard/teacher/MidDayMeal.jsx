import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaDownload, FaSave, FaPlus, FaTrash, FaCalculator, FaFilePdf, FaFileCsv } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../Firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';

const MidDayMeal = () => {
  const { t } = useLanguage();
  const [studentCount, setStudentCount] = useState(0);
  const [mealType, setMealType] = useState('Regular');
  const [loading, setLoading] = useState(false);

  const initialIngredients = [
    { id: 1, name: 'Moong Dal', unit: 'kg', qtyPerStudent: 0.02 },
    { id: 2, name: 'Toor Dal', unit: 'kg', qtyPerStudent: 0.02 },
    { id: 3, name: 'Masoor Dal', unit: 'kg', qtyPerStudent: 0.02 },
    { id: 4, name: 'Matki', unit: 'kg', qtyPerStudent: 0.02 },
    { id: 5, name: 'Mug', unit: 'kg', qtyPerStudent: 0.02 },
    { id: 6, name: 'Soyabin Vadi', unit: 'kg', qtyPerStudent: 0.01 },
    { id: 7, name: 'Rice / Wheat', unit: 'kg', qtyPerStudent: 0.1 },
    { id: 8, name: 'Jeera', unit: 'kg', qtyPerStudent: 0.001 },
    { id: 9, name: 'Mustard', unit: 'kg', qtyPerStudent: 0.001 },
    { id: 10, name: 'Turmeric', unit: 'kg', qtyPerStudent: 0.001 },
    { id: 11, name: 'Chili Powder', unit: 'kg', qtyPerStudent: 0.002 },
    { id: 12, name: 'Oil', unit: 'litre', qtyPerStudent: 0.005 },
    { id: 13, name: 'Salt', unit: 'kg', qtyPerStudent: 0.003 },
    { id: 14, name: 'Garlic', unit: 'kg', qtyPerStudent: 0.002 },
  ];

  const [ingredients, setIngredients] = useState(initialIngredients);

  const handleQtyChange = (id, newQty) => {
    setIngredients(prev => 
      prev.map(item => item.id === id ? { ...item, qtyPerStudent: parseFloat(newQty) || 0 } : item)
    );
  };

  const handleAddIngredient = () => {
    const name = prompt("Enter ingredient name:");
    if (!name) return;
    const unit = prompt("Enter unit (kg/litre):", "kg");
    const qty = parseFloat(prompt("Enter quantity per student:", "0.01")) || 0;
    
    setIngredients(prev => [
      ...prev, 
      { id: Date.now(), name, unit, qtyPerStudent: qty }
    ]);
  };

  const handleRemoveIngredient = (id) => {
    if (confirm("Are you sure you want to remove this ingredient?")) {
      setIngredients(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateTotal = (qtyPerStudent) => {
    return (qtyPerStudent * studentCount).toFixed(3);
  };

  const handleSave = async () => {
    if (studentCount <= 0) {
      toast.error('Please enter student count');
      return;
    }

    setLoading(true);
    try {
      const record = {
        date: new Date().toISOString(),
        studentCount,
        mealType,
        ingredients: ingredients.map(img => ({
          name: img.name,
          qtyPerStudent: img.qtyPerStudent,
          totalQty: calculateTotal(img.qtyPerStudent),
          unit: img.unit
        }))
      };

      await addDoc(collection(db, 'midDayMealRecords'), record);
      toast.success('Record saved successfully! ✅');
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Ingredient Name', 'Qty Per Student', 'Total Quantity', 'Unit'];
    const rows = ingredients.map(img => [
      img.name,
      img.qtyPerStudent,
      calculateTotal(img.qtyPerStudent),
      img.unit
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MidDayMeal_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 flex items-center gap-2">
            <FaUtensils className="text-primary-600" />
            Mid-Day Meal Ingredient Calculator
          </h1>
          <p className="text-dark-500 text-sm">Calculate and manage daily meal ingredients</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddIngredient}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm text-sm"
          >
            <FaPlus /> Add Ingredient
          </button>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm text-sm"
          >
            <FaFileCsv /> Export CSV
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">Number of Students Present</label>
            <input 
              type="number" 
              value={studentCount}
              onChange={(e) => setStudentCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Enter count..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">Meal Type (Optional)</label>
            <select 
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-dark-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="Regular">Regular (Dal-Rice)</option>
              <option value="Khichdi">Khichdi</option>
              <option value="Usal">Usal (Matki/Mug)</option>
              <option value="Special">Special Occasion</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">Total Weight Calculated</span>
              <span className="text-xl font-bold text-primary-800">
                {ingredients.reduce((acc, curr) => acc + parseFloat(calculateTotal(curr.qtyPerStudent)), 0).toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-50 border-b border-dark-100">
                <th className="px-6 py-4 text-sm font-bold text-dark-700">Ingredient Name</th>
                <th className="px-6 py-4 text-sm font-bold text-dark-700">Qty per Student (kg/L)</th>
                <th className="px-6 py-4 text-sm font-bold text-dark-700">Total Required Qty</th>
                <th className="px-6 py-4 text-sm font-bold text-dark-700">Unit</th>
                <th className="px-6 py-4 text-sm font-bold text-dark-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {ingredients.map((item) => (
                <tr key={item.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-dark-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      step="0.001"
                      value={item.qtyPerStudent}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      className="w-24 px-2 py-1 border border-dark-200 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg font-bold text-sm">
                      {calculateTotal(item.qtyPerStudent)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500 font-medium">{item.unit}</td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleRemoveIngredient(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Ingredient"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-dark-500 bg-amber-50 p-4 rounded-xl border border-amber-100">
        <p><strong>Note:</strong> Total quantities are auto-calculated based on current student count. You can manually adjust per-student quantities if needed for specific meals.</p>
      </div>
    </div>
  );
};

export default MidDayMeal;
