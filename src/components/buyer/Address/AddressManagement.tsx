import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Plus } from 'lucide-react';
import '../../styles/AddressManagement.css';

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
    <div className="address-management">
      <div className="address-header">
        <h2>
          <MapPin size={24} /> Saved Addresses
        </h2>
        <button
          className="btn-primary"
          onClick={() => {
            if (!showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
        >
          <Plus size={20} /> Add Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <form className="address-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Province/City *</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                required
              >
                <option value="">Select province</option>
                <option value="Hanoi">Hà Nội</option>
                <option value="HCMC">TP. Hồ Chí Minh</option>
                <option value="Danang">Đà Nẵng</option>
                <option value="Other">Tỉnh khác</option>
              </select>
            </div>
            <div className="form-group">
              <label>District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
              >
                <option value="">Select district</option>
                <option value="District 1">Quận/Huyện 1</option>
                <option value="District 2">Quận/Huyện 2</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ward *</label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                required
              >
                <option value="">Select ward</option>
                <option value="Ward 1">Phường/Xã 1</option>
                <option value="Ward 2">Phường/Xã 2</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Address *</label>
            <textarea
              name="detailedAddress"
              value={formData.detailedAddress}
              onChange={handleInputChange}
              placeholder="Street address, building number, apartment, etc."
              rows={3}
              required
            ></textarea>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
              />
              Set as default address
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      <div className="addresses-list">
        {addresses.length === 0 ? (
          <div className="empty-state">
            <MapPin size={48} />
            <p>No addresses saved yet</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`address-card ${address.isDefault ? 'default' : ''}`}
            >
              {address.isDefault && <span className="default-badge">Default</span>}
              <div className="address-details">
                <h4>{address.fullName}</h4>
                <p className="phone">📞 {address.phone}</p>
                <p className="location">
                  📍 {address.detailedAddress}, {address.ward}, {address.district}, {address.province}
                </p>
              </div>
              <div className="address-actions">
                <button
                  className="btn-icon-edit"
                  onClick={() => handleEdit(address)}
                  title="Edit address"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="btn-icon-delete"
                  onClick={() => onDeleteAddress(address.id)}
                  title="Delete address"
                >
                  <Trash2 size={18} />
                </button>
                {!address.isDefault && (
                  <button
                    className="btn-set-default"
                    onClick={() => onSetDefault(address.id)}
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManagement;
