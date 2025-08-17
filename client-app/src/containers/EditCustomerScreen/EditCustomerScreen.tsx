import React, {useState} from 'react';
import {ZellerCustomerInput} from '../../types/User';
import {EditCustomerScreenProps} from '../../navigation/schema_types/navigation-schema';
import {useAppDispatch} from '../../store/hooks';
import {updateCustomer} from '../../store/slices/customersSlice';
import {CustomerForm, ConfirmationModal} from '../../components/Molecules';

const EditCustomerScreen = ({navigation, route}: EditCustomerScreenProps) => {
  const dispatch = useAppDispatch();
  const {customer} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (customerData: ZellerCustomerInput) => {
    try {
      await dispatch(updateCustomer({id: customer.id, updates: customerData})).unwrap();
      setModalType('success');
      setModalMessage('Customer updated successfully');
      setModalVisible(true);
    } catch (err) {
      setModalType('error');
      setModalMessage('Failed to update customer');
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
        title="Edit Customer"
        customer={customer}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
        submitButtonText="Update Customer"
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

export default EditCustomerScreen;
