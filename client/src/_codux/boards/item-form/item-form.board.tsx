import { createBoard } from '@wixc3/react-board';
import { ItemForm } from '../../../components/item-form/item-form';

export default createBoard({
    name: 'ItemForm',
    Board: () => <ItemForm />,
});
