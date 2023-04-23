import { createBoard } from '@wixc3/react-board';
import { SavedItem } from '../../../components/new-recipe-page/saved-item/saved-item';

export default createBoard({
    name: 'SavedItem',
    Board: () => <SavedItem />,
});
