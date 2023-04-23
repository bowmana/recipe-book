import { createBoard } from '@wixc3/react-board';
import { ItemForm } from '../../../components/new-recipe-page/item-form/item-form';

export default createBoard({
    name: 'ItemForm',
    Board: () => <ItemForm />,
});
