import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Image from 'next/image';

const Modal = ({ isOpen, onClose, title, content, buttons, icon }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getIconPath = (iconName) => {
    const validIcons = ['Info', 'Warning', 'Error', 'Success'];
    return validIcons.includes(iconName) ? `/modal/${iconName}.png` : null;
  };

  const handleButtonClick = (onClick) => {
    setIsLoading(true);
    setTimeout(() => {
      onClick();
      setTimeout(() => {
        setIsLoading(false); // Reset loading state after 0.2 seconds + 0.1 seconds for animation
        onClose(); // Close the modal after the additional 0.1 seconds
      }, 160); // 0.1 seconds delay for animation
    }, 300); // 0.2 seconds delay
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-dialog-title"
      aria-describedby="modal-dialog-description"
    >
      <DialogTitle id="modal-dialog-title">
        <Box display="flex" alignItems="center">
          {icon && (
            <Box mr={2}>
              <Image src={getIconPath(icon)} alt={icon} width="32" height="32" style={{ marginTop: 10 }} />
            </Box>
          )}
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography id="modal-dialog-description">
          {content}
        </Typography>
      </DialogContent>
      <DialogActions>
        {isLoading ? (
          <LoadingButton loading variant="outlined">
            Loading...
          </LoadingButton>
        ) : (
          buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button.onClick)}
              color={button.color || 'primary'}
              variant={button.variant || 'text'}
            >
              {button.label}
            </Button>
          ))
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;

// Usage example:
// import Modal from './Modal';
// import { useState } from 'react';
//
// const App = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//
//   const handleOpenModal = () => setIsModalOpen(true);
//   const handleCloseModal = () => setIsModalOpen(false);
//
//   return (
//     <div>
//       <Button onClick={handleOpenModal}>Open Modal</Button>
//       <Modal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         title="Example Modal"
//         content="This is an example modal dialog."
//         icon="Info"
//         buttons={[
//           { label: 'Cancel', onClick: handleCloseModal },
//           { label: 'Confirm', onClick: handleCloseModal, color: 'primary', variant: 'contained' },
//         ]}
//       />
//     </div>
//   );
// };