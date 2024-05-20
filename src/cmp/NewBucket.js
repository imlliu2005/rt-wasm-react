import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { classNames } from "primereact/utils";
import mc from "../util/mc";
import { Toast } from "primereact/toast";
import useToast from "../cmp/useToast";
import { downloadAllObjects, obj_list } from '../util/fetch'
import { downloadData } from '../util/s3api'
import { db, add, read, readAll, removeAll, update as up, remove as rm } from '../util/indexdb'
import { wasm } from "../util/load_wasm";

const NewBucket = ({ onRefresh }) => {

  const [displayBasic, setDisplayBasic] = useState(false);

  const [toast, showError, showSuccess] = useToast();

  const defaultValues = {
    bucketName: "",
    enableLocking: "",
    region: ""
  };

  const { control, formState: { errors }, handleSubmit, reset } = useForm({ defaultValues });

  const onSubmit = async (data) => {

    const {
      bucketName,
      enableLocking,
      region
    } = data;

    try {
      await mc.makeBucket(bucketName, region, { ObjectLocking: enableLocking });

      reset();
      setDisplayBasic(false);
      showSuccess(`Created ${bucketName} successfully`);
      onRefresh?.();

    } catch (er) {
      showError(`Error creating ${bucketName}`);
    }
  };

  const getFormErrorMessage = (name) => {
    return errors[name] && <small className="p-error">{errors[name].message}</small>;
  };


  return (

    <>
      <Toast ref={toast} />
      <Dialog header="Create New Bucket" visible={displayBasic} style={{ width: "50vw" }}
        onHide={() => setDisplayBasic(false)}>

        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          <div className="field mt-5">
            <span className="p-float-label">
              <Controller name="bucketName" control={control}
                rules={{ required: "Name is required." }}
                render={({ field, fieldState }) => (
                  <InputText id={field.name} {...field} autoFocus
                    className={classNames({ "p-invalid": fieldState.invalid })} />
                )} />
              <label htmlFor="bucketName"
                className={classNames({ "p-error": errors.bucketName })}>Name*</label>
            </span>
            {getFormErrorMessage("name")}

          </div>
          <div className="mt-10">
            <span className="p-float-label">
              <Controller name="region" control={control} render={({ field, fieldState }) => (
                <InputText id={field.name} {...field} autoFocus
                  className={classNames({ "p-invalid": fieldState.invalid })} />
              )} />
              <label htmlFor="region"
                className={classNames({ "p-error": errors.bucketName })}>Region</label>
            </span>

          </div>
          <div className="field-checkbox mt-5">
            <Controller name="enableLocking" control={control} render={({ field, fieldState }) => (
              <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value}
                className={classNames({ "p-invalid": fieldState.invalid })} />
            )} />
            <label htmlFor="enableLocking" className={classNames({ "p-error": errors.accept })}>Enable Locking</label>
          </div>

          <div className="flex gap-5 items-center justify-end mt-5">
            <button className="h-12 bg-pink-800 border border-gray-100 w-24 text-white rounded" type="submit">Submit
            </button>
            <button className="h-12 bg-pink-800 border border-gray-100 w-24 text-white rounded" type="cancel">Cancel
            </button>
          </div>
        </form>
      </Dialog>

      <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          // wasm._read_from_idb('dcmdb', '004f89e7-f779-4ee0-85a3-fd9804bc7680.dcm');
        }}> read-data-from-idb
      </button>
      <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          // downloadData();  // s3 download
          downloadAllObjects();
        }}> DownloadFetch
      </button>
      {/* <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          add(db, 1, { name: '张三', age: 24, email: 'zhangsan@example.com' }, 'dcmStore');
        }}> Add
      </button>*/}
      <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          read(db, 1, 'dcmStore');
        }}> Read
      </button>
      <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          readAll(db, 'dcmStore');
        }}> ReadAll
      </button>
      <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          wasm._SetArgument('loglevel', 'info');
          console.log(wasm._test(99, 1));
        }}> wasm-test
      </button>
      <button className="px-2 h-8 bg-pink-800 border border-gray-100 text-white rounded" type="submit"
        onClick={() => {
          removeAll(db, 'dcmStore');
        }}> RemoveAll
      </button>
    </>

  );
};

export default NewBucket;