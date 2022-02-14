
import { Types } from "mongoose";
import { List } from "../../schema/List";
import { IContext } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  listId: string;
  bookmarked: boolean;
  favourite: boolean;
}

export default async function updateBookmark({listId, bookmarked, favourite}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updateBookmark -> no user found in context");
    return false;
  }   
  
  const lid = new Types.ObjectId(listId);
  const uid = new Types.ObjectId(context.user._id);
  
  const list = await List.findOne({'_id': lid});
  const user = await User.findOne({'_id': uid});

  if (list && user) {
    if (bookmarked) {
      const own = (list.owner._id.equals(uid));
      const entry = {list: lid, added_at: new Date(), favourite: favourite, own: own};
      await User.updateOne({'_id': uid}, { $addToSet: { bookmarks: entry }})
      return true;
    } else {
      await User.updateOne({'_id': uid}, { $pull: { bookmarks: { list: lid }}})
      return true;
    }
  }

  return false;
}