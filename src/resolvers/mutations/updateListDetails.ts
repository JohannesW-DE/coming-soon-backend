import { List } from "../../schema/List";
import { IContext } from "../../schema/types";

interface IArgs {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  url: string;
}

export default async function updateListDetails({id, name, description, isPublic, url}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updateListDetails -> no user found in context");
    return;
  }

  const list = await List.findOne({_id: id});
  if (list) {
    list.name = name;
    list.description = description;
    list.is_public = isPublic;
    list.url = url;
    const doc = await list.save();
    if (doc) {
      return true;
    }
  }

  return false;
}
