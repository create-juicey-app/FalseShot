import Modal from '../components/Modal';
import { useState } from 'react';
import { Button } from '@mui/material';
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  return (
    <div>
      <Button onClick={handleOpenModal}>Open Modal</Button>
      <Modal
        icon="Warning"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Delete Confirmation"
        content="Are you sure to delete the selected file?"
        buttons={[
          { label: 'Cancel', onClick: handleCloseModal },
          { label: 'Confirm', onClick: handleCloseModal, color: 'primary', variant: 'contained' },
        ]}
      />
    </div>
  );
};
export default App;