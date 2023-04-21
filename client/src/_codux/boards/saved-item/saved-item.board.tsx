import { createBoard } from '@wixc3/react-board';
import { SavedItem } from '../../../components/saved-item/saved-item';

export default createBoard({
    name: 'SavedItem',
    Board: () => <SavedItem />
});
