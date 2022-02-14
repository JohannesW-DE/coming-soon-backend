import { List } from "../../schema/List";
import { IContext } from "../../schema/types";

interface IArgs {
  name: string,
  description: string,
  url: string,
  isPublic: boolean,
}

export default async function createList({name, description, url, isPublic}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("createList -> no user found in context");
    return false;
  }   
  const list = new List({
    created: new Date(),
    modified: new Date(),
    is_public: isPublic,
    name: name,
    description: description,
    url: url,
    entries: [],
    owner: context.user._id,
  });

  const result = await list.save();

  if (result) {
    return result._id;
  } else {
    return '';
  }
}
