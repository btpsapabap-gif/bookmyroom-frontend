/* ===========================================================
   BookMyRoom Enterprise
   Supabase File Upload
=========================================================== */

"use strict";

/* ===========================================================
   SUPABASE CLIENT
=========================================================== */

const supabaseClient = supabase.createClient(

    SUPABASE_URL,

    SUPABASE_ANON_KEY

);

/* ===========================================================
   UPLOAD ID PROOF
=========================================================== */

async function uploadIDProof(file, mobile) {

    try {

        if (!file) {

            return null;

        }

        const extension =

            file.name

                .split(".")

                .pop()

                .toLowerCase();

        const fileName =

            `guest_${mobile}_${Date.now()}.${extension}`;

        const filePath =

            `${mobile}/${fileName}`;

        const {

            error

        } = await supabaseClient

            .storage

            .from(ID_PROOF_BUCKET)

            .upload(

                filePath,

                file,

                {

                    upsert: true

                }

            );

        if (error) {

            throw error;

        }

        const {

            data

        } = supabaseClient

            .storage

            .from(ID_PROOF_BUCKET)

            .getPublicUrl(filePath);

        return data.publicUrl;

    }

    catch (err) {

        console.error(err);

        throw err;

    }

}

/* ===========================================================
   DELETE ID PROOF
=========================================================== */

async function deleteIDProof(filePath) {

    try {

        const {

            error

        } = await supabaseClient

            .storage

            .from(ID_PROOF_BUCKET)

            .remove([

                filePath

            ]);

        if (error) {

            throw error;

        }

    }

    catch (err) {

        console.error(err);

    }

}