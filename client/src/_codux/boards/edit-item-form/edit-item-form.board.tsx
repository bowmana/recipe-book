import { createBoard } from '@wixc3/react-board';
import { EditItemForm } from '../../../components/edit-item-form/edit-item-form';

export default createBoard({
    name: 'EditItemForm',
    Board: () => <EditItemForm />
});
