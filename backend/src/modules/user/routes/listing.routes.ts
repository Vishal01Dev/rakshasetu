import { Router } from 'express';
import { verifyLoggedUser } from '../../../middlewares/middleware';
import { addListing, updateListing, deleteListing, getLoggedUserListings, getSingleListing, getUserListings } from '../controllers/listing.controller';
import { upload } from '../../../middlewares/multer';


const router = Router();

router.use(verifyLoggedUser);

router.post('/add', upload.array('media', 10), addListing)
router.post('/update/:listingId', upload.array('media', 10), updateListing);
router.post('/delete/:listingId', deleteListing)

router.get('/', getLoggedUserListings);
router.get('/:listingId', getSingleListing);
router.get("/u/:userId", getUserListings)

export default router;