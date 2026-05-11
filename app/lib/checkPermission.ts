export function checkPermission(
  arryPermission: any = [],
  toModule: string = ""
) {
  for (const perm of arryPermission) {
    const slug = perm?.menu?.translations[0].slug;
    const parts = slug.split("/"); // ['', 'cms', 'module', 'role', 'list']

    if (parts.includes(toModule)) {
      // console.log("Ada segment 'role'");
      return true;
    } else {
      return false;
    }
  }
}
export function detailPermission(
  arryPermission: any = [],
  toModule: string = ""
) {
  //   console.log("wow", arryPermission);
  let objPrm: any = {
    list: false,
    add: false,
    edit: false,
    delete: false,
    active: false,
    reject: false,
    approve: false,
    view: false,
  };
  // DebugLog(arryPermission);
  for (const perm of arryPermission) {
    const slug = perm?.menu?.translations[0]?.slug;
    const parts = slug.split("/"); // ['', 'cms', 'module', 'role', 'list']
    // console.log("wowowowo", parts);
    if (parts.includes(toModule)) {
      // console.log("Ada segment masuk" + toModule, parts);
      objPrm = {
        list: perm?.view,
        add: perm?.create,
        edit: perm?.update,
        delete: perm?.deleted,
        active: perm?.create,
        reject: perm?.create,
        approve: perm?.create,
        view: perm?.view,
      };
    }
  }
  return objPrm;
}
export function getMenuArryByModule(arryMenu: any = [], toModule: string = "") {
  // console.log("toModule", toModule);
  for (const perm of arryMenu) {
    // console.log("arrTrans", perm?.translations);
    for (const item of perm?.translations) {
      const slugid = item?.slug ?? "";
      const partsid = slugid.split("/"); // ['', 'cms', 'module', 'role', 'list']
      if (partsid.includes(toModule)) {
        // console.log(toModule, item?.name);
        return {
          id: perm.id,
          name: item?.name,
        };
      }
    }
  }
  return {
    id: 0,
    name: "-",
  };
}
