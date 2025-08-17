import React, {useState} from 'react';
import {ZellerCustomerInput} from '../../types/User';
import {AddCustomerScreenProps} from '../../navigation/schema_types/navigation-schema';
import {useAppDispatch} from '../../store/hooks';
import {addCustomer} from '../../store/slices/customersSlice';
import {CustomerForm, ConfirmationModal} from '../../components/Molecules';

const AddCustomerScreen = ({navigation}: AddCustomerScreenProps) => {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (customerData: ZellerCustomerInput) => {
    try {
      await dispatch(addCustomer(customerData)).unwrap();
      setModalType('success');
      setModalMessage('Customer added successfully');
      setModalVisible(true);
    } catch (err) {
      setModalType('error');
      setModalMessage('Failed to add customer');
      setModalVisible(true);
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      navigation.goBack();
    }
  };

  return (
    <>
      <CustomerForm
        title="Add Customer"
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
        submitButtonText="Add Customer"
      />
      
      <ConfirmationModal
        visible={modalVisible}
        type={modalType}
        message={modalMessage}
        onConfirm={handleModalConfirm}
        showCancel={false}
      />
    </>
  );
};

export default AddCustomerScreen;
