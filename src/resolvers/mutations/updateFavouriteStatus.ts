
import { Types } from "mongoose";
import { List } from "../../schema/List";
import { IContext } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  listId: string;
  favourite: boolean;
}

export default async function updateFavouriteStatus({listId, favourite}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updateFavouriteStatus -> no user found in context");
    return false;
  }

  const lid = new Types.ObjectId(listId)
  const uid = new Types.ObjectId(context.user._id);

  const list = await List.findOne({_id: lid});

  if (list) {
    const doc = await User.findOneAndUpdate(
      {
        '_id': uid,
        'bookmarks.list': lid,
      },
      {
        $set: {'bookmarks.$.favourite': favourite}
      }
    )
    if (!doc) { // not bookmared so far
      const own = list.owner._id.equals(uid);
      const entry = {list: lid, added_at: new Date(), favourite: favourite, own: own};
      await User.updateOne({'_id': uid}, { $addToSet: { bookmarks: entry }})
    }
    return true;
  }

  return false;
}