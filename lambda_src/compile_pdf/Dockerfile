FROM public.ecr.aws/lambda/python:3.12

# Install Tectonic (LaTeX compiler)
# Need curl, tar, gzip, and runtime libs like graphite2
RUN yum install -y curl tar xz gzip graphite2 harfbuzz
RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net |sh
RUN mv tectonic /usr/local/bin/

# Install python dependencies for local app (if needed)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy handler
COPY app.py ${LAMBDA_TASK_ROOT}

# Warmup Tectonic Cache
# NOTE: We cannot use /tmp because Lambda mounts a fresh empty tmpfs there at runtime.
# We must use a directory that persists in the image.
ENV TECTONIC_CACHE_DIR=/usr/local/share/tectonic_cache
COPY warmup.tex ${LAMBDA_TASK_ROOT}
RUN mkdir -p ${TECTONIC_CACHE_DIR} && \
    tectonic ${LAMBDA_TASK_ROOT}/warmup.tex && \
    rm ${LAMBDA_TASK_ROOT}/warmup.tex && \
    chmod -R 777 ${TECTONIC_CACHE_DIR}

CMD [ "app.handler" ]
