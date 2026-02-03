import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Plus } from 'lucide-react';


export interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  isDefault: boolean;
}

interface AddressManagementProps {
  addresses: Address[];
  onAddAddress: (address: Omit<Address, 'id'>) => void;
  onDeleteAddress: (addressId: string) => void;
  onEditAddress: (address: Address) => void;
  onSetDefault: (addressId: string) => void;
}

export const AddressManagement: React.FC<AddressManagementProps> = ({
  addresses,
  onAddAddress,
  onDeleteAddress,
  onEditAddress,
  onSetDefault,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailedAddress: '',
    isDefault: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEditAddress({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      onAddAddress(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      detailedAddress: '',
      isDefault: false,
    });
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detailedAddress: address.detailedAddress,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-[900px] mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin size={20} /> Saved Addresses</h2>
        <button className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2" onClick={() => { if (!showForm) resetForm(); setShowForm(!showForm); }}><Plus size={18} /> Add Address</button>
      </div>

      {showForm && (
        <form className="bg-white p-4 rounded shadow mb-6" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold mb-3">{editingId ? 'Edit Address' : 'Add New Address'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <input className="mt-1 w-full border rounded p-2" type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number *</label>
              <input className="mt-1 w-full border rounded p-2" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" required />
            </div>

            <div>
              <label className="block text-sm font-medium">Province/City *</label>
              <select className="mt-1 w-full border rounded p-2" name="province" value={formData.province} onChange={handleInputChange} required>
                <option value="">Select province</option>
                <option value="Hanoi">Hà Nội</option>
                <option value="HCMC">TP. Hồ Chí Minh</option>
                <option value="Danang">Đà Nẵng</option>
                <option value="Other">Tỉnh khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">District *</label>
              <select className="mt-1 w-full border rounded p-2" name="district" value={formData.district} onChange={handleInputChange} required>
                <option value="">Select district</option>
                <option value="District 1">Quận/Huyện 1</option>
                <option value="District 2">Quận/Huyện 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Ward *</label>
              <select className="mt-1 w-full border rounded p-2" name="ward" value={formData.ward} onChange={handleInputChange} required>
                <option value="">Select ward</option>
                <option value="Ward 1">Phường/Xã 1</option>
                <option value="Ward 2">Phường/Xã 2</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Detailed Address *</label>
              <textarea className="mt-1 w-full border rounded p-2" name="detailedAddress" value={formData.detailedAddress} onChange={handleInputChange} placeholder="Street address, building number, apartment, etc." rows={3} required />
            </div>

            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2"><input className="h-4 w-4" type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} /> Set as default address</label>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editingId ? 'Update Address' : 'Save Address'}</button>
            <button type="button" className="border px-4 py-2 rounded" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-gray-600">
            <MapPin size={48} />
            <p>No addresses saved yet</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className={`p-4 border rounded flex items-start gap-4 ${address.isDefault ? 'ring-2 ring-green-100' : ''}`}>
              {address.isDefault && <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
              <div className="flex-1">
                <h4 className="font-semibold">{address.fullName}</h4>
                <p className="text-sm text-gray-500">📞 {address.phone}</p>
                <p className="text-sm text-gray-500">📍 {address.detailedAddress}, {address.ward}, {address.district}, {address.province}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="text-blue-600" onClick={() => handleEdit(address)} title="Edit address"><Edit2 size={18} /></button>
                <button className="text-red-600" onClick={() => onDeleteAddress(address.id)} title="Delete address"><Trash2 size={18} /></button>
                {!address.isDefault && <button className="text-sm text-gray-700 border px-3 py-1 rounded" onClick={() => onSetDefault(address.id)}>Set Default</button>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManagement;
